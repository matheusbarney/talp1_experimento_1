# Closed Questions Manager

A small full-stack TypeScript app for managing closed questions.

Each question has:
- description
- options

Each option has:
- description
- isCorrect (boolean)

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

## Validation Rules

- question description is required
- at least 2 options are required
- every option needs a description
- at least one option must be marked as correct

## Scope

Included:
- CRUD for questions
- add/remove/update options in a question
- modern responsive UI

Not included:
- authentication/login
- authorization/access control
