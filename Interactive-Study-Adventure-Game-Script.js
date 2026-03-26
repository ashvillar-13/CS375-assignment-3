// ----- GAME VARIABLES -----
let currentLevel = "";
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;

// Timer for Hard Mode:
let timer;
let timeLeft = 15;

let readingMode = false;
let sustainabilityMode = false;
let artMode = false; // NEW (for art feature)

let answered = false;
let correctIndex = -1;
let currentStory = "";
let allQuestionsData = {}; // Store all questions from JSON


// ----- LOAD QUESTIONS JSON -----
function loadQuestionsJSON(callback) {
    fetch("output.json")
        .then(response => response.json())
        .then(data => {
            allQuestionsData = data;
            callback();
        })
        .catch(error => console.error("Error loading questions JSON:", error));
}


// ----- TEMPORARY FEEDBACK FUNCTION -----
function showTempFeedback(message) {
    var feedbackEl = document.getElementById("feedback");
    feedbackEl.textContent = message;

    setTimeout(function() {
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
    } 
    else if (category === "sustainability") {
        sustainabilityMode = true;
    }
    else if (category === "art") {
        artMode = true;

        document.getElementById("menuScreen").style.display = "none";
        document.getElementById("artScreen").style.display = "block";

        // Load your pixel grid
        createGrid(16,16);

        return;
    }

    document.getElementById("menuScreen").style.display = "none";
    document.getElementById("levelScreen").style.display = "block";
}


// ----- TIMER (FOR HARD LEVELS) -----
function startTimer() {
    clearInterval(timer);
    timeLeft = 15;

    document.getElementById("timerText").textContent = "Time: " + timeLeft;

    timer = setInterval(function () {
        timeLeft--;
        document.getElementById("timerText").textContent = "Time: " + timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById("feedback").textContent = "Time's up!";
            moveToNextQuestion();
        }
    }, 1000);
}


// ----- LOAD QUESTION -----
function loadQuestion() {
    clearScreenForNextQuestion();

    answered = false;
    var q = questions[currentQuestionIndex];

    document.getElementById("questionText").textContent = q.question || "";

    if (readingMode && q.story) {
        document.getElementById("storyText").textContent = q.story;
    }

    // Sustainability mode (MC buttons)
    if (sustainabilityMode) {

        document.getElementById("answerInput").style.display = "none";
        document.getElementById("submitButton").style.display = "none";
        document.getElementById("hintButton").style.display = "none";

        correctIndex = q.correct;

        for (let i = 0; i < q.options.length; i++) {
            let btn = document.createElement("button");
            btn.textContent = q.options[i];

            btn.onclick = (function(index) {
                return function () {
                    checkMCAnswer(index);
                };
            })(i);

            document.getElementById("optionsContainer").appendChild(btn);
        }

    } else {

        document.getElementById("answerInput").style.display = "inline";
        document.getElementById("submitButton").style.display = "inline";
        document.getElementById("hintButton").style.display = "inline";
    }

    // Timer
    if (currentLevel === "hard") {
        startTimer();
    } else {
        clearInterval(timer);
        document.getElementById("timerText").textContent = "";
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

    currentLevel = level;
    currentQuestionIndex = 0;
    score = 0;

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
                    story: passage.story
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
    setLevel(level);

    document.getElementById("levelScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
}


// ----- NEXT QUESTION -----
function moveToNextQuestion() {
    clearScreenForNextQuestion();
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

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    document.getElementById("finalScore").textContent =
        "Score: " + score + " | High Score: " + highScore;
}


// ----- CHECK ANSWER -----
function checkAnswer() {

    if (answered) return;

    let userAnswer = document.getElementById("answerInput").value.toLowerCase().trim();

    if (userAnswer === "") {
        showTempFeedback("Please enter an answer.");
        return;
    }

    let correct = false;

    if (readingMode) {
        for (let ans of questions[currentQuestionIndex].answers) {
            if (userAnswer === ans.toLowerCase().trim()) correct = true;
        }
    } else {
        if (userAnswer === questions[currentQuestionIndex].answer.toLowerCase().trim()) {
            correct = true;
        }
    }

    if (correct) {
        answered = true;
        score++;
        updateScoreText();
        showTempFeedback("Correct!");
        setTimeout(moveToNextQuestion, 1500);
    } else {
        showTempFeedback("Wrong answer. Try using a hint.");
    }
}


// ----- SKIP QUESTION -----
function skipQuestion() {
    clearInterval(timer);
    showTempFeedback("Question skipped.");
    moveToNextQuestion();
}


// ----- MULTIPLE CHOICE -----
function checkMCAnswer(index) {

    clearInterval(timer);

    let correctIndex = questions[currentQuestionIndex].correct;

    if (index === correctIndex) {
        score++;
        updateScoreText();
        showTempFeedback("Correct!");
    } else {
        showTempFeedback("Incorrect.");
    }

    setTimeout(moveToNextQuestion, 2000);
}


// ----- SHOW HINT -----
function showHint() {
    let hint = questions[currentQuestionIndex].hint;
    document.getElementById("modalHintText").textContent = "Hint: " + hint;
    document.getElementById("hintModal").style.display = "block";
}

// ----- CLOSE HINT -----
function closeHint() {
    document.getElementById("hintModal").style.display = "none";
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
}


// ----- ENTER KEY -----
document.addEventListener("DOMContentLoaded", function () {

    loadQuestionsJSON(function() {
        const levelButtons = document.querySelectorAll(".level-btn");
        levelButtons.forEach(btn => {
            btn.addEventListener("click", function() {
                startGame(btn.dataset.level);
            });
        });
    });

    document.getElementById("closeHintBtn").onclick = closeHint;

    var input = document.getElementById("answerInput");
    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            checkAnswer();
        }
    });
});
