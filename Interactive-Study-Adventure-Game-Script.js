// ---- IMPORTS ----
import { renderQuestion, showFeedback } from "./uiController.js";
import { updateScore, isCorrectAnswer } from "./gameLogic.js";
import { loadQuestions } from "./dataManager.js";

// ----- GAME VARIABLES -----
let currentLevel = "";
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let mathHighScore = Number(localStorage.getItem("mathHighScore")) || 0;
let readingHighScore = Number(localStorage.getItem("readingHighScore")) || 0;
let sustainabilityHighScore = Number(localStorage.getItem("sustainabilityHighScore")) || 0;
let questionLocked = false;
let activeMode = "";
let correctIndex = -1;

// Timer for Hard Mode:
let timer;
let timeLeft = 5;

let readingMode = false;
let sustainabilityMode = false;
let artMode = false; 

let answered = false;
let lastFocusedElement = null;
let allQuestionsData = null;

// ---- HIGH SCORE HELPER METHOD ----
function getHighScore() {
  if (readingMode) {
    return readingHighScore;
  }
  if (sustainabilityMode) { 
    return sustainabilityHighScore;
  }
  return mathHighScore;
}

// ----- TEMPORARY FEEDBACK FUNCTION -----
function showTempFeedback(message) {
  var feedbackEl = document.getElementById("feedback");
  feedbackEl.textContent = message;

  setTimeout(function () {
    feedbackEl.textContent = "";
  }, 2000);
}

// ----- CLEAR SCREEN FUNCTION -----
function clearScreenForNextQuestion() {
  // Removed modal dependency (your HTML doesn’t use it anymore)
  document.getElementById("questionText").textContent = "";
  document.getElementById("storyText").textContent = "";
  document.getElementById("optionsContainer").innerHTML = "";
  document.getElementById("answerInput").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("timerText").textContent = "";
  document.getElementById("hintText").textContent = "";
}

// ----- CHOOSE CATEGORY -----
function chooseCategory(category) {
  readingMode = false;
  sustainabilityMode = false;
  artMode = false;

  if (category === "reading") {
    readingMode = true;
  } else if (category === "sustainability") {
    sustainabilityMode = true;
  } else if (category === "art") {
    artMode = true;

    document.getElementById("menuScreen").style.display = "none";
    document.getElementById("artScreen").style.display = "block";

    // Load your pixel grid
    function createGrid(rows, cols) {
      const container = document.querySelector("#canvas");
      container.innerHTML = ""; // Clear existing content

      // Set container to grid layout
      container.style.display = "grid";
      container.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      container.style.gap = "0px";

      // Initialize the 2D logic array
      // This maps the visual DOM to a data structure
      const gridState = Array(rows)
        .fill(null)
        .map(() => Array(cols).fill(0));

      function updateCanvasCell(cell, x, y) {
        cell.setAttribute("aria-pressed", gridState[x][y] === 1 ? "true" : "false");
        cell.setAttribute(
          "aria-label",
          `Row ${y + 1}, Column ${x + 1}, ${gridState[x][y] === 1 ? "filled" : "empty"}`
        );
      }

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cell = document.createElement("button");
          cell.type = "button";
          cell.className = "canvas-cell";

          // Store coordinates in dataset for easy retrieval
          // dataset property allows you to attach custom data to an HTML element, attributes that start with data-
          cell.dataset.x = x;
          cell.dataset.y = y;
          updateCanvasCell(cell, x, y);

          // Visual feedback and state update
          cell.addEventListener("click", () => {
            // Update the logic array (1 = occupied/clicked)
            if (gridState[x][y] == 0) {
              gridState[x][y] = 1;
            } else {
              gridState[x][y] = 0;
            }
            updateCanvasCell(cell, x, y);
          });

          container.appendChild(cell);
        }
      }
      return gridState;
    }
    const myCanvas = createGrid(16, 16);
    document.querySelector("#canvas .canvas-cell")?.focus();
    return myCanvas;
  }

  document.getElementById("menuScreen").style.display = "none";
  document.getElementById("levelScreen").style.display = "block";
  document.querySelector(".level-btn")?.focus();
}

// ----- TIMER (FOR HARD LEVELS) -----
function startTimer() {
  clearInterval(timer);
  timeLeft = 5;

  document.getElementById("timerText").textContent = "Time: " + timeLeft;

  timer = setInterval(function () {
    timeLeft--;
    document.getElementById("timerText").textContent = "Time: " + timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);

      document.getElementById("feedback").textContent = "Time's up!";
      setTimeout(moveToNextQuestion, 1500);
    }
  }, 1000);
}

// ----- LOAD QUESTION -----
function loadQuestion() {
  clearScreenForNextQuestion();

  questionLocked = false;
  clearInterval(timer);

  answered = false;
  var q = questions[currentQuestionIndex];

  renderQuestion(q, readingMode); // new line for assignment 3

  // Sustainability mode (MC buttons)
  if (sustainabilityMode) {
    document.getElementById("answerInput").style.display = "none";
    document.getElementById("submitButton").style.display = "none";
    document.getElementById("hintButton").style.display = "none";

    correctIndex = q.correct;

    for (let i = 0; i < q.options.length; i++) {
      let btn = document.createElement("button");
      btn.textContent = q.options[i];

      btn.onclick = (function (index) {
        return function () {
          checkMCAnswer(index);
        };
      })(i);

      document.getElementById("optionsContainer").appendChild(btn);
    }
  } else {
    document.getElementById("answerInput").style.display = "";
    document.getElementById("submitButton").style.display = "";
    document.getElementById("hintButton").style.display = "";
    document.getElementById("optionsContainer").innerHTML = "";
  }

  // Timer
  if (currentLevel === "hard") {
    startTimer();
  } else {
    clearInterval(timer);
    document.getElementById("timerText").textContent = "";
  }

  if (sustainabilityMode) {
    document.querySelector("#optionsContainer button")?.focus();
  } else {
    document.getElementById("answerInput").focus();
  }
}

// ----- SHUFFLE ARRAY -----
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ----- SET LEVEL -----
function setLevel(level) {
  questionLocked = false;
  answered = false;
  clearInterval(timer);

  currentLevel = level;
  currentQuestionIndex = 0;
  score = 0;

  if (readingMode) {
    activeMode = "reading";
  } 
  else if (sustainabilityMode) {
    activeMode = "sustainability";
  } 
  else {
    activeMode = "math";
  }

  if (readingMode) {
    let storyArray = allQuestionsData.reading[level];
    shuffleArray(storyArray);
    questions = [];

    for (let passage of storyArray) {
      for (let q of passage.questions) {
        questions.push({
          question: q.question,
          answers: q.answers,
          hint: q.hint,
          story: passage.story,
        });
      }
    }
  } else if (sustainabilityMode) {
    questions = allQuestionsData.sustainability[level];
  } else {
    questions = allQuestionsData.math[level];
  }

  updateScoreText();
  loadQuestion();
}

// ----- START GAME -----
function startGame(level) {
  answered = false;
  questionLocked = false;
  clearInterval(timer);

  setLevel(level);

  document.getElementById("levelScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
}

// ----- NEXT QUESTION -----
function moveToNextQuestion() {
  if (!questionLocked) questionLocked = true;
  clearInterval(timer);

  currentQuestionIndex++;

  if (currentQuestionIndex >= questions.length) {
    endGame();
    return;
  }

  loadQuestion();
}

// ----- END GAME -----
function endGame() {
  clearInterval(timer);

  if (activeMode === "reading" && score > readingHighScore) {
    readingHighScore = score;
    localStorage.setItem("readingHighScore", readingHighScore);
  } 
  else if (activeMode === "sustainability" && score > sustainabilityHighScore) {
    sustainabilityHighScore = score;
    localStorage.setItem("sustainabilityHighScore", sustainabilityHighScore);
  } 
  else if (activeMode === "math" && score > mathHighScore) {
    mathHighScore = score;
    localStorage.setItem("mathHighScore", mathHighScore);
  }

  let displayHighScore;

  if (activeMode === "reading") {
    displayHighScore = readingHighScore;
  } else if (activeMode === "sustainability") {
    displayHighScore = sustainabilityHighScore;
  } else {
    displayHighScore = mathHighScore;
  }

  document.getElementById("finalScore").textContent =
    "Score: " + score + " | High Score: " + displayHighScore;

  document.getElementById("finalScore").focus();

  console.log("MODE:", activeMode);
console.log("SCORES:", mathHighScore, readingHighScore, sustainabilityHighScore);
}

// ----- CHECK ANSWER -----
function checkAnswer() {

  if (answered) return;

  let userAnswer = document
    .getElementById("answerInput")
    .value.toLowerCase()
    .trim();

  if (userAnswer === "") {
    showTempFeedback("Please enter an answer.");
    return;
  }

  let correct = false;

  if (readingMode) {
    for (let ans of questions[currentQuestionIndex].answers) {
      if (isCorrectAnswer(userAnswer, ans)) { // new line for assignment 3
        correct = true; // new line for assignment 3
      }
    }
  } else {
    correct = isCorrectAnswer(userAnswer,questions[currentQuestionIndex].answer); // new line for assignment 3
  }

  if (correct) {
    answered = true;
    clearInterval(timer);

    score = updateScore(score); // new line for assignment 3
    updateScoreText();
    showFeedback("Correct!"); // new line for assignment 3
    setTimeout(moveToNextQuestion, 1500);
  } else {
    showTempFeedback("Wrong answer. Try using a hint.");
    return;
  }
}

// ----- SKIP QUESTION -----
function skipQuestion() {
  clearInterval(timer);

  showTempFeedback("Question skipped.");
  setTimeout(moveToNextQuestion, 1000);
}

// ----- MULTIPLE CHOICE -----
function checkMCAnswer(index) {
  clearInterval(timer);

  let correctIndex = questions[currentQuestionIndex].correct;

  if (index === correctIndex) {
    score = updateScore(score); // new line for assignment 3
    updateScoreText();
    showFeedback("Correct!"); // new line for assignment 3
  } else {
    showTempFeedback("Incorrect.");
  }

  setTimeout(moveToNextQuestion, 2000);
}

// ----- SHOW HINT -----
function showHint() {
  let hint = questions[currentQuestionIndex].hint;
  document.getElementById("modalHintText").textContent = "Hint: " + hint;
  lastFocusedElement = document.activeElement;
  document.getElementById("hintModal").style.display = "block";
  document.getElementById("closeHintBtn").focus();
}

// ----- CLOSE HINT -----
function closeHint() {
  document.getElementById("hintModal").style.display = "none";
  lastFocusedElement?.focus();
}

// ----- SCORE -----
function updateScoreText() {
  document.getElementById("scoreText").textContent = "Score: " + score;
}

// ----- MENU -----
function goToMenu() {
  document.getElementById("menuScreen").style.display = "block";
  document.getElementById("levelScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("artScreen").style.display = "none";

  clearInterval(timer);
  document.querySelector("#menuScreen button")?.focus();
}

// ----- STARTUP/EVENT LISTENERS -----
document.addEventListener("DOMContentLoaded", function () {

  loadQuestions(function (data) {
    allQuestionsData = data;

    // Level buttons
    document.querySelectorAll(".level-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        startGame(btn.dataset.level);
      });
    });

    // Category buttons
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        chooseCategory(btn.dataset.category);
      });
    });

    // Grid (only if exists)
    if (typeof createGrid !== "undefined") {
      createGrid(16, 16, Quizard);
    }
  });

  // Buttons
  document.getElementById("submitButton").addEventListener("click", checkAnswer);
  document.getElementById("skipButton").addEventListener("click", skipQuestion);
  document.getElementById("hintButton").addEventListener("click", showHint);
  document.getElementById("backButton").addEventListener("click", goToMenu);
  document.getElementById("artBackButton").addEventListener("click", goToMenu);

  document.getElementById("closeHintBtn").onclick = closeHint;

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (document.getElementById("hintModal").style.display === "block") {
        closeHint();
      }
    }
  });

  document.getElementById("answerInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });

});
