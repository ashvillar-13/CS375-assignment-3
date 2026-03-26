// ----- GAME VARIABLES -----
let currentLevel = "";
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0; // Reset High Score
// Timer for Hard Mode:
let timer;  // stores setInterval (timer) reference
let timeLeft = 15; // seconds per question
let readingMode = false;
let sustainabilityMode = false;
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

    setTimeout(function() { // Remove message after 2 seconds
        feedbackEl.textContent = "";
    }, 2000);
}

// ----- CLEAR SCREEN FUNCTION ----- 
function clearScreenForNextQuestion() {
    document.getElementById("hintModal").style.display = "none";
    document.getElementById("questionText").textContent = "";
    document.getElementById("storyText").textContent = "";
    document.getElementById("optionsContainer").innerHTML = "";
    document.getElementById("answerInput").value = "";
    document.getElementById("feedback").textContent = "";
    document.getElementById("timerText").textContent = "";
    document.getElementById("hintText").textContent = "";
}

// ----- 'CHOOSE A CATEGORY' SECTION -----
function chooseCategory(category) {
    readingMode = false;
    sustainabilityMode = false;

    if (category === "reading") {
        readingMode = true;
    } else if (category === "sustainability") {
        sustainabilityMode = true;
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
    clearScreenForNextQuestion(); // clear old data

    answered = false;
    var q = questions[currentQuestionIndex];

    document.getElementById("questionText").textContent = q.question || "";
    
    if (readingMode && q.story) {
        document.getElementById("storyText").textContent = q.story;
    }

    document.getElementById("hintText").textContent = "";
    document.getElementById("optionsContainer").innerHTML = "";
    document.getElementById("answerInput").value = "";


    // Sustainability buttons
    if (sustainabilityMode) {
        document.getElementById("answerInput").style.display = "none";
        document.getElementById("submitButton").style.display = "none";
        document.getElementById("hintButton").style.display = "none";

        correctIndex = q.correct;

        // Create MC buttons
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
        document.getElementById("hintButton").disabled = false;
    }

    // Timer
    if (currentLevel === "hard") {
        startTimer();
    } else {
        clearInterval(timer);
        document.getElementById("timerText").textContent = "";
    }
}

// ----- SHUFFLE ARRAY (FOR READING CATEGORY) -----
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ----- SET LEVEL -----
function setLevel(level) {
    currentLevel = level;
    currentQuestionIndex = 0;
    score = 0;

    document.getElementById("feedback").textContent = "";
    document.getElementById("answerInput").value = "";
    document.getElementById("answerInput").style.display = "inline";
    document.getElementById("storyText").textContent = "";

    
    // Show/hide buttons appropriately
    if (sustainabilityMode) {
        document.getElementById("submitButton").style.display = "none";
        document.getElementById("hintButton").style.display = "none";
        document.getElementById("answerInput").style.display = "none";
        document.getElementById("skipButton").style.display = "none";
    } else {
        document.getElementById("submitButton").style.display = "inline";
        document.getElementById("hintButton").style.display = "inline";
        document.getElementById("answerInput").style.display = "inline";
        document.getElementById("skipButton").style.display = "inline";
    }

// ----- LOAD QUESTIONS FROM JSON -----
    if (readingMode) { // reading section
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
    } else if (sustainabilityMode) { // sustainability section
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
    clearScreenForNextQuestion(); // clear everything on screen first before next question
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

    document.getElementById("questionText").textContent = "";
    document.getElementById("answerInput").style.display = "none";
    document.getElementById("timerText").textContent = "";
    document.getElementById("hintText").textContent = "";
    document.getElementById("optionsContainer").innerHTML = "";

    document.getElementById("submitButton").style.display = "none";
    document.getElementById("hintButton").style.display = "none";
    document.getElementById("skipButton").style.display = "none"

    // Update/set highscore 

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    // Show highscore (score is already shown) 
    document.getElementById("finalScore").textContent = "High Score: " + highScore;
}


// ----- CHECK ANSWER -----
function checkAnswer() {
    if (answered) {
        return;
    }

    let userAnswer = document.getElementById("answerInput").value;

    // make input lowercase + remove spaces
    userAnswer = userAnswer.toLowerCase().trim();

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
            if (userAnswer === questions[currentQuestionIndex].answer.toLowerCase().trim()) correct = true;
        }

        if (correct) {
            answered = true;
            score++;
            updateScoreText();
            showTempFeedback("Correct!");
            setTimeout(moveToNextQuestion, 1500); // 1.5 seconds
        } else {
            showTempFeedback("Wrong answer. Try using a hint.");
        }
}


// ----- SKIP QUESTION -----
function skipQuestion() {

    clearScreenForNextQuestion();

    answered = true; // Mark current question as answered

    clearInterval(timer); // Stop the timer if running

    showTempFeedback("Question skipped."); // Feedback to show skipping

    moveToNextQuestion();
}


// ----- MULTIPLE CHOICE (MC) -----
function checkMCAnswer(index) {
    
    clearInterval(timer); // Stop timer immediately when user clicks

    let correctIndex = questions[currentQuestionIndex].correct;

    if (index === correctIndex) {
        score++;
        updateScoreText();
        showTempFeedback("Correct!");
    } else {
        showTempFeedback("Incorrect. The correct answer is: " + questions[currentQuestionIndex].options[correctIndex]);
    }

    // Wait 3 seconds before going to next question
    setTimeout(function() {
        moveToNextQuestion();  // move to next question
        if (currentLevel === "hard") {
            startTimer();  // restart 15-second timer for next question
        }
    }, 3000);
}


// ----- SHOW HINT -----
function showHint() {
    let hint = questions[currentQuestionIndex].hint; // Get the current question's hint

    document.getElementById("hintText").innerText = hint; // Put the hint text in the popup

    document.getElementById("hintModal").style.display = "block"; // Show the popup
}

// ----- CLOSE HINT -----
function closeHint() {
    document.getElementById("hintModal").style.display = "none"; // Hide the popup
}

// ----- CONNECT CLOSE BUTTON AFTER PAGE LOAD -----
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("closeHintBtn").onclick = closeHint; // When the close button is clicked, run closeHint
});


// ----- SCORE -----
function updateScoreText() {
    document.getElementById("scoreText").textContent = "Score: " + score;
}

// ----- MENU -----
function goToMenu() {
    document.getElementById("menuScreen").style.display = "block";
    document.getElementById("levelScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";

    clearInterval(timer);

    document.getElementById("questionText").textContent = "";
    document.getElementById("storyText").textContent = ""; 
    document.getElementById("feedback").textContent = "";
    document.getElementById("hintText").textContent = "";
    document.getElementById("optionsContainer").innerHTML = "";
    document.getElementById("answerInput").value = "";
    document.getElementById("finalScore").textContent = "";

    // reset modes
    readingMode = false;
    sustainabilityMode = false;
}

// ----- ENTER KEY (FOR SUBMIT BUTTON)-----
document.addEventListener("DOMContentLoaded", function () {
    // Load JSON first
    loadQuestionsJSON(function() {
        console.log("Questions loaded!");
        const levelButtons = document.querySelectorAll(".level-btn"); // Now enable level buttons
        levelButtons.forEach(btn => {
            btn.addEventListener("click", function() {
                startGame(btn.dataset.level);
            });
        });
    });

    document.getElementById("closeHintBtn").onclick = closeHint; // Hint close button

    var input = document.getElementById("answerInput"); // Enter key
    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            checkAnswer();
        }
    });
});

