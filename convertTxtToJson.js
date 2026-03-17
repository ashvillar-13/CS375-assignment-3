#!/usr/bin/env node
/*
  Simple TXT -> JSON converter

  - Configure `inputFile` and `outputFile` below.
  - The input .txt file must contain pairs of lines: question (line N) and hint (line N+1).
  - Output JSON structure:
    {
      "questions": [
        { "Question0": { "question": "...", "hint": "..." } },
        { "Question1": { "question": "...", "hint": "..." } }
      ]
    }
*/

const fs = require('fs');
const path = require('path');

// --- Configure filenames here ---
const inputFile = 'input.txt';
const outputFile = 'output.json';
// -------------------------------

const inputPath = path.join(__dirname, inputFile);
const outputPath = path.join(__dirname, outputFile);

try {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const lines = raw.split(/\r?\n/);

  // Remove a single trailing empty line caused by final newline (keep intentional empty lines)
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  const questions = [];
  let qIndex = 0;
  for (let i = 0; i < lines.length; i += 2) {
    const question = lines[i] ?? '';
    const hint = (i + 1 < lines.length) ? lines[i + 1] : '';
    const obj = {};
    obj[`Question${qIndex}`] = { question, hint };
    questions.push(obj);
    qIndex += 1;
  }

  const output = { questions };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Wrote ${questions.length} question(s) to ${outputPath}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exitCode = 1;
}
