/**
 * Increases the score by 1.
 *
 * @param {number} score - The current score
 * @returns {number} The updated score
 */
export function updateScore(score) {
  return score + 1;
}

/**
 * Checks whether the user's answer matches the correct answer.
 * Comparison is case-insensitive and ignores extra spaces.
 *
 * @param {string} userAnswer - The answer typed by the user
 * @param {string} correctAnswer - The correct answer
 * @returns {boolean} True if the answer is correct, otherwise false
 */
export function isCorrectAnswer(userAnswer, correctAnswer) {
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
}
