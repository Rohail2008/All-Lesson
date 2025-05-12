let quizData = [];
let currentQuestion = 0;
let score = 0;
let currentLesson = "";

const lessonCodes = {
  "L1": { take: "L1TAKE", retake: "L1RETAKE" },
  "L2": { take: "L2TAKE", retake: "L2RETAKE" },
  "L3": { take: "L3TAKE", retake: "L3RETAKE" },
  "L4": { take: "L4TAKE", retake: "L4RETAKE" },
  "L5": { take: "L5TAKE", retake: "L5RETAKE" },
  "L6": { take: "L6TAKE", retake: "L6RETAKE" },
  "L7": { take: "L7TAKE", retake: "L7RETAKE" },
  "L8": { take: "L8TAKE", retake: "L8RETAKE" },
  "L9": { take: "L9TAKE", retake: "L9RETAKE" },
  "L10": { take: "L10TAKE", retake: "L10RETAKE" },
  "L11": { take: "L11TAKE", retake: "L11RETAKE" },
  "L12": { take: "L12TAKE", retake: "L12RETAKE" },
  "L13": { take: "L13TAKE", retake: "L13RETAKE" },
  "L14": { take: "L14TAKE", retake: "L14RETAKE" },
  "L15": { take: "L15TAKE", retake: "L15RETAKE" },
  "L16": { take: "L16TAKE", retake: "L16RETAKE" }
};

// DOM Elements
const welcomePage = document.getElementById("welcome-page");
const codePage = document.getElementById("code-page");
const quizPage = document.getElementById("quiz-page");
const scorePage = document.getElementById("score-page");

document.getElementById("start-quiz-btn").addEventListener("click", () => {
  showPage("code");
});

document.getElementById("submit-code-btn").addEventListener("click", () => {
  const code = document.getElementById("code-input").value.trim().toUpperCase();
  const error = document.getElementById("error-message");
  error.textContent = "";

  const lessonKey = Object.keys(lessonCodes).find(key =>
    code === lessonCodes[key].take || code === lessonCodes[key].retake
  );

  if (!lessonKey) {
    error.textContent = "Invalid code.";
    return;
  }

  const saved = localStorage.getItem(lessonKey);
  if (saved === "done" && code !== lessonCodes[lessonKey].retake) {
    error.textContent = "Retake code required.";
    return;
  }

  currentLesson = lessonKey;
  loadQuiz(lessonKey, code);
});

document.getElementById("next-btn").addEventListener("click", () => {
  checkAnswer();
  currentQuestion++;

  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    showScore();
  }
});

document.getElementById("retake-quiz-btn").addEventListener("click", () => {
  document.getElementById("code-input").value = "";
  showPage("code");
});

function showPage(name) {
  welcomePage.style.display = name === "welcome" ? "block" : "none";
  codePage.style.display = name === "code" ? "block" : "none";
  quizPage.style.display = name === "quiz" ? "block" : "none";
  scorePage.style.display = name === "score" ? "block" : "none";
}

function loadQuiz(lessonKey, code) {
  fetch(`lesson${lessonKey.slice(1)}.json`)
    .then(res => res.json())
    .then(data => {
      if (data.code !== code) {
        alert("Code does not match lesson file.");
        return;
      }
      quizData = data.questions;
      currentQuestion = 0;
      score = 0;
      showPage("quiz");
      showQuestion();
    })
    .catch(() => {
      alert("Error loading quiz data.");
    });
}

function showQuestion() {
  const q = quizData[currentQuestion];
  document.getElementById("question").textContent = `Q${currentQuestion + 1}: ${q.question}`;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  if (q.type === "mcq") {
    q.options.forEach(opt => {
      const label = document.createElement("label");
      //  *** CRUCIAL CHANGE:  SAME NAME ATTRIBUTE  ***
      label.innerHTML = `<input type="radio" name="quiz-option" value="${opt}"> ${opt}`;
      optionsDiv.appendChild(label);
    });
  } else if (q.type === "truefalse") {
    ["True", "False"].forEach(opt => {
      const label = document.createElement("label");
      //  *** CRUCIAL CHANGE:  SAME NAME ATTRIBUTE  ***
      label.innerHTML = `<input type="radio" name="quiz-option" value="${opt.toLowerCase()}"> ${opt}`;
      optionsDiv.appendChild(label);
    });
  } else {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "quiz-option"; //  Keep a consistent name here too, for simplicity
    input.placeholder = "Type your answer...";
    optionsDiv.appendChild(input);
  }
}

function checkAnswer() {
  const q = quizData[currentQuestion];
  let userAnswer = "";

  const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
  if (selectedOption) {
    userAnswer = selectedOption.value.trim().toLowerCase();
  } else {
    const textInput = document.querySelector('input[name="quiz-option"]');
    if (textInput) {
      userAnswer = textInput.value.trim().toLowerCase();
    }
  }

  if (userAnswer === q.answer.toLowerCase()) {
    score++;
  }
}

function showScore() {
  localStorage.setItem(currentLesson, "done");
  document.getElementById("score").textContent = `${score} / ${quizData.length}`;
  showPage("score");
}
