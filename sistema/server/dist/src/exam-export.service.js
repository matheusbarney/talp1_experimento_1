import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "./db.js";
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT_MARGIN = 48;
const RIGHT_MARGIN = 48;
const TOP_MARGIN = 52;
const FOOTER_MARGIN = 30;
const FONT_SIZE_BODY = 11;
const LINE_SPACING = 15;
const testWithQuestionsInclude = {
    testQuestions: {
        orderBy: {
            position: "asc"
        },
        include: {
            question: {
                include: {
                    options: {
                        orderBy: {
                            id: "asc"
                        }
                    }
                }
            }
        }
    }
};
function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
function indexToLetters(index) {
    let value = index + 1;
    let result = "";
    while (value > 0) {
        const remainder = (value - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        value = Math.floor((value - 1) / 26);
    }
    return result;
}
function optionLabelByMode(mode, index) {
    if (mode === "POWERS_OF_TWO") {
        return String(2 ** index);
    }
    return indexToLetters(index);
}
function wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let currentLine = "";
    for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(candidate, fontSize);
        if (width <= maxWidth) {
            currentLine = candidate;
            continue;
        }
        if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
        }
        else {
            lines.push(word);
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines.length > 0 ? lines : [""];
}
function drawFooter(page, font, examNumber) {
    const footerText = `Exam Number: ${examNumber}`;
    page.drawText(footerText, {
        x: LEFT_MARGIN,
        y: FOOTER_MARGIN,
        size: 10,
        font,
        color: rgb(0.25, 0.28, 0.32)
    });
}
function drawHeader(page, boldFont, regularFont, examNumber, header) {
    let y = PAGE_HEIGHT - TOP_MARGIN;
    page.drawText(header.title, {
        x: LEFT_MARGIN,
        y,
        size: 18,
        font: boldFont,
        color: rgb(0.1, 0.14, 0.2)
    });
    y -= 24;
    page.drawText(`Class: ${header.className}`, {
        x: LEFT_MARGIN,
        y,
        size: FONT_SIZE_BODY,
        font: regularFont
    });
    y -= 16;
    page.drawText(`Teacher: ${header.teacher}`, {
        x: LEFT_MARGIN,
        y,
        size: FONT_SIZE_BODY,
        font: regularFont
    });
    y -= 16;
    page.drawText(`Date: ${header.date}`, {
        x: LEFT_MARGIN,
        y,
        size: FONT_SIZE_BODY,
        font: regularFont
    });
    y -= 16;
    page.drawText(`Exam Number: ${examNumber}`, {
        x: LEFT_MARGIN,
        y,
        size: FONT_SIZE_BODY,
        font: regularFont
    });
    if (header.additionalInfo) {
        y -= 16;
        const infoLines = wrapText(`Additional Info: ${header.additionalInfo}`, regularFont, FONT_SIZE_BODY, PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN);
        for (const line of infoLines) {
            page.drawText(line, {
                x: LEFT_MARGIN,
                y,
                size: FONT_SIZE_BODY,
                font: regularFont
            });
            y -= LINE_SPACING;
        }
    }
    y -= 10;
    return y;
}
export async function generateExamsPackage(testId, payload) {
    const testRaw = await prisma.test.findUnique({
        where: { id: testId },
        include: testWithQuestionsInclude
    });
    const test = testRaw;
    if (!test) {
        throw new Error("Test not found");
    }
    const baseQuestions = test.testQuestions.map((entry) => ({
        description: entry.question.description,
        options: entry.question.options.map((option) => ({
            description: option.description,
            isCorrect: option.isCorrect
        }))
    }));
    if (baseQuestions.length === 0) {
        throw new Error("Test has no questions");
    }
    const zip = new JSZip();
    const answerRows = [];
    const questionCount = baseQuestions.length;
    const csvHeader = [
        "ExamNumber",
        ...Array.from({ length: questionCount }, (_item, index) => [`Q${index + 1}`, `Q${index + 1}_OPTIONS`]).flat()
    ];
    answerRows.push(csvHeader);
    for (let examIndex = 0; examIndex < payload.count; examIndex += 1) {
        const examNumber = payload.startNumber + examIndex;
        const randomizedQuestions = shuffle(baseQuestions).map((question) => ({
            description: question.description,
            options: shuffle(question.options)
        }));
        const answersForExam = [String(examNumber)];
        for (const question of randomizedQuestions) {
            const labels = question.options.map((_option, optionIndex) => optionLabelByMode(test.identifierMode, optionIndex));
            const optionsMetadata = labels.join("|");
            if (test.identifierMode === "LETTERS") {
                const correctLabels = labels.filter((_label, optionIndex) => question.options[optionIndex].isCorrect);
                answersForExam.push(correctLabels.join("+"));
                answersForExam.push(optionsMetadata);
            }
            else {
                let sum = 0;
                for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
                    if (question.options[optionIndex].isCorrect) {
                        sum += Number(labels[optionIndex]);
                    }
                }
                answersForExam.push(String(sum));
                answersForExam.push(optionsMetadata);
            }
        }
        answerRows.push(answersForExam);
        const pdfBytes = await renderExamPdf({ examNumber, questions: randomizedQuestions }, test.identifierMode, {
            title: payload.header.title,
            className: payload.header.className,
            teacher: payload.header.teacher,
            date: payload.header.date,
            additionalInfo: payload.header.additionalInfo
        });
        const fileNumber = String(examNumber).padStart(4, "0");
        zip.file(`exam_${fileNumber}.pdf`, pdfBytes);
    }
    const csvContent = answerRows
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
        .join("\n");
    zip.file("answer_sheet.csv", csvContent);
    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    const fileNameSlug = test.description.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "test";
    return {
        fileName: `${fileNameSlug}-exams.zip`,
        buffer: Buffer.from(zipBytes)
    };
}
async function renderExamPdf(exam, mode, header) {
    const pdf = await PDFDocument.create();
    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = drawHeader(page, boldFont, regularFont, exam.examNumber, header);
    drawFooter(page, regularFont, exam.examNumber);
    const contentWidth = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
    function ensureSpace(linesNeeded) {
        const minY = FOOTER_MARGIN + 25;
        if (y - linesNeeded * LINE_SPACING >= minY) {
            return;
        }
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - TOP_MARGIN;
        drawFooter(page, regularFont, exam.examNumber);
    }
    for (let questionIndex = 0; questionIndex < exam.questions.length; questionIndex += 1) {
        const question = exam.questions[questionIndex];
        const questionText = `${questionIndex + 1}. ${question.description}`;
        const questionLines = wrapText(questionText, boldFont, FONT_SIZE_BODY, contentWidth);
        ensureSpace(questionLines.length + question.options.length + 2);
        for (const line of questionLines) {
            page.drawText(line, {
                x: LEFT_MARGIN,
                y,
                size: FONT_SIZE_BODY,
                font: boldFont,
                color: rgb(0.12, 0.14, 0.18)
            });
            y -= LINE_SPACING;
        }
        y -= 2;
        for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
            const option = question.options[optionIndex];
            const label = optionLabelByMode(mode, optionIndex);
            const optionLines = wrapText(`${label}) ${option.description}`, regularFont, FONT_SIZE_BODY, contentWidth - 12);
            ensureSpace(optionLines.length + 1);
            for (const line of optionLines) {
                page.drawText(line, {
                    x: LEFT_MARGIN + 12,
                    y,
                    size: FONT_SIZE_BODY,
                    font: regularFont,
                    color: rgb(0.17, 0.2, 0.25)
                });
                y -= LINE_SPACING;
            }
        }
        y -= 6;
    }
    ensureSpace(7);
    page.drawText("Student Name: _____________________________________________", {
        x: LEFT_MARGIN,
        y,
        size: FONT_SIZE_BODY,
        font: regularFont
    });
    y -= 24;
    page.drawText("CPF: _________________________________", {
        x: LEFT_MARGIN,
        y,
        size: FONT_SIZE_BODY,
        font: regularFont
    });
    return pdf.save();
}
