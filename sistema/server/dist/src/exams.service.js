import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
function parseCsv(csvBuffer) {
    return parse(csvBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });
}
function normalizeHeader(rawHeader) {
    return rawHeader.trim().toUpperCase();
}
function splitLabels(value) {
    return value
        .split(/[+,;|\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.toUpperCase());
}
function parseAnswerSheet(csvBuffer) {
    const rows = parseCsv(csvBuffer);
    if (rows.length === 0) {
        throw new Error("Answer sheet CSV is empty");
    }
    const rawHeaders = Object.keys(rows[0]);
    const headerByNormalized = new Map(rawHeaders.map((header) => [normalizeHeader(header), header]));
    const examHeader = headerByNormalized.get("EXAMNUMBER");
    if (!examHeader) {
        throw new Error("Answer sheet CSV must contain ExamNumber column");
    }
    const questionNumbers = rawHeaders
        .map((header) => normalizeHeader(header))
        .filter((header) => /^Q\d+$/.test(header))
        .map((header) => Number(header.slice(1)))
        .sort((a, b) => a - b);
    if (questionNumbers.length === 0) {
        throw new Error("Answer sheet CSV must include at least one question column (Q1, Q2...)");
    }
    return rows.map((row) => {
        const examNumber = String(row[examHeader] ?? "").trim();
        if (!examNumber) {
            throw new Error("Every answer sheet row must include ExamNumber");
        }
        const questions = questionNumbers.map((questionNumber) => {
            const questionHeader = headerByNormalized.get(`Q${questionNumber}`);
            const optionsHeader = headerByNormalized.get(`Q${questionNumber}_OPTIONS`);
            const answer = String(row[questionHeader] ?? "").trim();
            const rawOptions = optionsHeader ? String(row[optionsHeader] ?? "").trim() : "";
            const optionLabels = rawOptions
                ? rawOptions
                    .split("|")
                    .map((label) => label.trim())
                    .filter(Boolean)
                : [];
            return {
                answer,
                optionLabels
            };
        });
        return {
            examNumber,
            questions
        };
    });
}
function parseStudentAnswers(csvBuffer) {
    const rows = parseCsv(csvBuffer);
    if (rows.length === 0) {
        throw new Error("Student answers CSV is empty");
    }
    const rawHeaders = Object.keys(rows[0]);
    const headerByNormalized = new Map(rawHeaders.map((header) => [normalizeHeader(header), header]));
    const examHeader = headerByNormalized.get("EXAMNUMBER");
    if (!examHeader) {
        throw new Error("Student answers CSV must contain ExamNumber column");
    }
    const studentHeader = headerByNormalized.get("STUDENTNAME") ?? headerByNormalized.get("NAME");
    const cpfHeader = headerByNormalized.get("CPF");
    if (!studentHeader) {
        throw new Error("Student answers CSV must contain StudentName column");
    }
    if (!cpfHeader) {
        throw new Error("Student answers CSV must contain CPF column");
    }
    const questionNumbers = rawHeaders
        .map((header) => normalizeHeader(header))
        .filter((header) => /^Q\d+$/.test(header))
        .map((header) => Number(header.slice(1)))
        .sort((a, b) => a - b);
    if (questionNumbers.length === 0) {
        throw new Error("Student answers CSV must include at least one question column (Q1, Q2...)");
    }
    return rows.map((row) => ({
        studentName: String(row[studentHeader] ?? "").trim(),
        cpf: String(row[cpfHeader] ?? "").trim(),
        examNumber: String(row[examHeader] ?? "").trim(),
        answers: questionNumbers.map((questionNumber) => {
            const header = headerByNormalized.get(`Q${questionNumber}`);
            return String(row[header] ?? "").trim();
        })
    }));
}
function decodePowerSumToSet(value, labels) {
    const numericLabels = labels.map((label) => Number(label));
    if (numericLabels.some((label) => !Number.isInteger(label) || label <= 0)) {
        throw new Error("Invalid power-of-two labels in answer sheet");
    }
    const sum = Number(value || "0");
    if (!Number.isInteger(sum) || sum < 0) {
        throw new Error(`Invalid numeric answer '${value}' for power-of-two question`);
    }
    const selected = new Set();
    for (const label of numericLabels) {
        if ((sum & label) === label) {
            selected.add(String(label));
        }
    }
    return selected;
}
function parseSelection(answer, optionLabels, answerLooksNumeric) {
    if (answerLooksNumeric) {
        return decodePowerSumToSet(answer, optionLabels);
    }
    return new Set(splitLabels(answer));
}
function equalSets(left, right) {
    if (left.size !== right.size) {
        return false;
    }
    for (const value of left) {
        if (!right.has(value)) {
            return false;
        }
    }
    return true;
}
function randomDigits(length) {
    let out = "";
    for (let i = 0; i < length; i += 1) {
        out += Math.floor(Math.random() * 10).toString();
    }
    return out;
}
function randomSubset(items) {
    const selected = items.filter(() => Math.random() < 0.5);
    if (selected.length === 0 && items.length > 0 && Math.random() < 0.5) {
        selected.push(items[Math.floor(Math.random() * items.length)]);
    }
    return selected;
}
export function evaluateExams(answerSheetBuffer, studentAnswersBuffer, mode) {
    const answerSheet = parseAnswerSheet(answerSheetBuffer);
    const students = parseStudentAnswers(studentAnswersBuffer);
    const answerSheetByExam = new Map(answerSheet.map((entry) => [entry.examNumber, entry]));
    const questionCount = answerSheet[0].questions.length;
    const reportRows = [];
    const perStudentScores = [];
    for (const student of students) {
        if (!student.studentName) {
            throw new Error("Every student row must include StudentName");
        }
        if (!student.cpf) {
            throw new Error(`Student '${student.studentName}' is missing CPF`);
        }
        const key = answerSheetByExam.get(student.examNumber);
        if (!key) {
            throw new Error(`No answer sheet found for ExamNumber '${student.examNumber}'`);
        }
        if (student.answers.length !== key.questions.length) {
            throw new Error(`Exam '${student.examNumber}' has mismatched question count`);
        }
        const questionScores = [];
        for (let questionIndex = 0; questionIndex < key.questions.length; questionIndex += 1) {
            const answerEntry = key.questions[questionIndex];
            const studentAnswer = student.answers[questionIndex] ?? "";
            const hasOptionLabels = answerEntry.optionLabels.length > 0;
            if (mode === "LIBERAL" && !hasOptionLabels) {
                throw new Error("Answer sheet is missing Q*_OPTIONS columns required for LIBERAL evaluation");
            }
            const answerLooksNumeric = hasOptionLabels && answerEntry.optionLabels.every((label) => /^\d+$/.test(label));
            const expectedSet = parseSelection(answerEntry.answer, answerEntry.optionLabels, answerLooksNumeric);
            const studentSet = parseSelection(studentAnswer, answerEntry.optionLabels, answerLooksNumeric);
            if (mode === "STRINGENT") {
                questionScores.push(equalSets(expectedSet, studentSet) ? 1 : 0);
                continue;
            }
            const labelsUniverse = new Set(answerEntry.optionLabels);
            let matches = 0;
            for (const label of labelsUniverse) {
                const expected = expectedSet.has(label);
                const actual = studentSet.has(label);
                if (expected === actual) {
                    matches += 1;
                }
            }
            const score = labelsUniverse.size > 0 ? matches / labelsUniverse.size : 0;
            questionScores.push(score);
        }
        const totalScore = questionScores.reduce((sum, value) => sum + value, 0);
        const totalPercent = questionCount > 0 ? (totalScore / questionCount) * 100 : 0;
        perStudentScores.push(totalPercent);
        reportRows.push([
            student.studentName,
            student.cpf,
            student.examNumber,
            mode,
            totalScore.toFixed(4),
            totalPercent.toFixed(2),
            ...questionScores.map((score) => score.toFixed(4))
        ]);
    }
    const average = perStudentScores.length > 0
        ? perStudentScores.reduce((sum, value) => sum + value, 0) / perStudentScores.length
        : 0;
    const header = [
        "StudentName",
        "CPF",
        "ExamNumber",
        "Mode",
        "TotalScore",
        "TotalPercent",
        ...Array.from({ length: questionCount }, (_unused, index) => `Q${index + 1}`)
    ];
    const csv = stringify([
        header,
        ...reportRows,
        ["CLASS_AVERAGE", "", "", mode, "", average.toFixed(2), ...Array.from({ length: questionCount }, () => "")]
    ]);
    return {
        fileName: "classroom_score_report.csv",
        content: csv
    };
}
export function generateRandomStudentAnswers(answerSheetBuffer, studentCount) {
    const answerSheet = parseAnswerSheet(answerSheetBuffer);
    if (studentCount < 1 || studentCount > 10000) {
        throw new Error("studentCount must be between 1 and 10000");
    }
    for (const exam of answerSheet) {
        for (const question of exam.questions) {
            if (question.optionLabels.length === 0) {
                throw new Error("Answer sheet is missing Q*_OPTIONS columns required to generate random student answers");
            }
        }
    }
    const questionCount = answerSheet[0].questions.length;
    const rows = [];
    for (let index = 0; index < studentCount; index += 1) {
        const exam = answerSheet[Math.floor(Math.random() * answerSheet.length)];
        const answers = exam.questions.map((question) => {
            const isNumeric = question.optionLabels.every((label) => /^\d+$/.test(label));
            const selected = randomSubset(question.optionLabels);
            if (isNumeric) {
                return selected.reduce((sum, label) => sum + Number(label), 0).toString();
            }
            return selected.join("+");
        });
        rows.push([
            `Student ${String(index + 1).padStart(3, "0")}`,
            randomDigits(11),
            exam.examNumber,
            ...answers
        ]);
    }
    const header = ["StudentName", "CPF", "ExamNumber", ...Array.from({ length: questionCount }, (_u, i) => `Q${i + 1}`)];
    const csv = stringify([header, ...rows]);
    return {
        fileName: "random_student_answers.csv",
        content: csv
    };
}
