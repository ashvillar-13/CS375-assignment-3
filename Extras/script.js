const startBtn = document.getElementById("start-btn");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const restartBtn = document.getElementById("restart-btn");

const startScreen = document.getElementById("start-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");

const scoreEl = document.getElementById("score");
const triesEl = document.getElementById("tries");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const finalScore = document.getElementById("final-score");
const finalCorrect = document.getElementById("final-correct");

const hintBtn = document.getElementById("hint-btn");

// Game state
let score = 0;
let correctAnswers = 0;
let currentQuestion = 0;
let triesLeft = 3;
let usedHint = false;
let difficulty = "easy";

// Dummy questions (your teammates can replace these)
const questions = {
    easy: [
        { q: "2+2?", answers: ["3","4","5"], correct: "4", hint: "Even number" },
        { q: "3+1?", answers: ["4","5","6"], correct: "4", hint: "Same as 2+2" },
        { q: "5-2?", answers: ["2","3","4"], correct: "3", hint: "Odd" },
        { q: "1+1?", answers: ["1","2","3"], correct: "2", hint: "Smallest even" },
        { q: "6-1?", answers: ["4","5","6"], correct: "5", hint: "Half of 10" }
    ],
    medium: [],
    hard: []
};

// Start → difficulty
startBtn.onclick = () => {
    startScreen.classList.remove("active");
    difficultyScreen.classList.add("active");
};

// Select difficulty
difficultyBtns.forEach(btn => {
    btn.onclick = () => {
        difficulty = btn.dataset.level;
        difficultyScreen.classList.remove("active");
        gameScreen.classList.add("active");
        loadQuestion();
    };
});

function loadQuestion() {
    let q = questions[difficulty][currentQuestion];

    questionEl.textContent = q.q;
    answersEl.innerHTML = "";
    triesLeft = 3;
    usedHint = false;

    triesEl.textContent = "Tries left: " + triesLeft;
    progressText.textContent = `Question ${currentQuestion + 1} / 5`;
    progressBar.style.width = ((currentQuestion) / 5) * 100 + "%";

    q.answers.forEach(ans => {
        let btn = document.createElement("button");
        btn.textContent = ans;
        btn.onclick = () => checkAnswer(ans);
        answersEl.appendChild(btn);
    });
}

function checkAnswer(answer) {
    let q = questions[difficulty][currentQuestion];

    if (answer === q.correct) {
        correctAnswers++;

        if (usedHint) {
            score += 1;
        } else {
            score += 2;
        }

        nextQuestion();
    } else {
        triesLeft--;
        triesEl.textContent = "Tries left: " + triesLeft;

        if (triesLeft === 0) {
            nextQuestion();
        }
    }

    scoreEl.textContent = "Score: " + score;
}

function nextQuestion() {
    currentQuestion++;

    if (currentQuestion === 5) {
        endGame();
    } else {
        loadQuestion();
    }
}

// Hint
hintBtn.onclick = () => {
    let q = questions[difficulty][currentQuestion];
    alert(q.hint);
    usedHint = true;
};

// End game
function endGame() {
    gameScreen.classList.remove("active");
    endScreen.classList.add("active");

    finalScore.textContent = "Total Score: " + score;
    finalCorrect.textContent = "Correct Answers: " + correctAnswers + "/5";
}

// Restart
restartBtn.onclick = () => {
    score = 0;
    correctAnswers = 0;
    currentQuestion = 0;

    endScreen.classList.remove("active");
    startScreen.classList.add("active");
};
