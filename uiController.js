/**
 * Renders the current question on the screen.
 * If reading mode is enabled, it also shows the story text.
 *
 * @param {Object} q - The question object containing question text and optional story
 * @param {boolean} readingMode - Whether reading mode is active
 */
export function renderQuestion(q, readingMode) {
  document.getElementById("questionText").textContent = q.question || "";

  if (readingMode && q.story) {
    document.getElementById("storyText").textContent = q.story;
  }
}

/**
 * Shows feedback message to the user for a short time (2 seconds).
 *
 * @param {string} message - The message to display
 */
export function showFeedback(message) {
  const feedbackEl = document.getElementById("feedback");
  feedbackEl.textContent = message;

  setTimeout(() => {
    feedbackEl.textContent = "";
  }, 2000);
}

