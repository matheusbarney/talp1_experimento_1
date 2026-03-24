# Closed Questions Manager

A small full-stack TypeScript app for managing closed questions and tests.

Each question has:
- description
- options

Each option has:
- description
- isCorrect (boolean)

Each test has:
- description
- identifierMode (letters or powers of two)
- selected questions
- exam package generation (randomized PDFs + CSV answer sheet)

## Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: SQLite with Prisma ORM

## Project Structure

- client: React application
- server: Express API + Prisma schema
- package.json: npm workspaces + root scripts

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create database and apply migration:

```bash
npm run prisma:migrate -w server
```

3. Seed sample data:

```bash
npm run prisma:seed -w server
```

## Run in Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Build

```bash
npm run build
```

## API Endpoints

- GET /health
- GET /questions
- GET /questions/:id
- POST /questions
- PUT /questions/:id
- DELETE /questions/:id
- GET /tests
- GET /tests/:id
- POST /tests
- PUT /tests/:id
- DELETE /tests/:id
- POST /tests/:id/generate-exams

### POST/PUT body example

```json
{
  "description": "Which one is a prime number?",
  "options": [
    { "description": "4", "isCorrect": false },
    { "description": "5", "isCorrect": true },
    { "description": "6", "isCorrect": false }
  ]
}
```

### Test POST/PUT body example

```json
{
  "description": "Midterm Set A",
  "identifierMode": "LETTERS",
  "questionIds": [1, 2, 3]
}
```

### Generate exams body example

```json
{
  "count": 30,
  "startNumber": 1,
  "header": {
    "title": "Midterm Exam",
    "className": "Math 101",
    "teacher": "Prof. Silva",
    "date": "2026-03-24",
    "additionalInfo": "No calculators"
  }
}
```

The endpoint returns a ZIP file containing:
- one randomized PDF exam per requested copy
- a CSV answer sheet with each exam number and expected answers

## Validation Rules

- question description is required
- at least 2 options are required
- every option needs a description
- at least one option must be marked as correct
- test description is required
- at least 1 question is required in each test
- selected question IDs must exist and cannot repeat
- exam generation requires count, start number and header fields

## Scope

Included:
- CRUD for questions
- add/remove/update options in a question
- CRUD for tests
- select existing questions inside a test
- configure test question labels as letters or powers of two
- generate N exam PDFs with randomized question and option order
- include per-exam header/footer and student identification area (Name and CPF)
- generate CSV answer sheet (letters or powers-of-two sum according to test mode)
- modern responsive UI

Not included:
- authentication/login
- authorization/access control
