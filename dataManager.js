let allQuestionsData = null;

/**
 * Loads the questions from output.json and passes the data to a callback.
 *
 * @param {function} callback - Function that runs after data is loaded.
 */
export function loadQuestions(callback) {
  fetch("output.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      allQuestionsData = data;
      callback(data);
    })
    .catch(function (error) {
      console.log("Error loading data:", error);
    });
}

/**
 * Returns all loaded question data.
 *
 * @returns {Object|null} The full question dataset or null if not loaded yet.
 */
export function getAllQuestions() {
  return allQuestionsData;
}
