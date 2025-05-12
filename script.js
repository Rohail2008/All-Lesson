let quizData = [];
let currentQuestion = 0;
let score = 0;
let currentLesson = "";
let currentCodeType = ""; // "take" or "retake"

const lessonCodes = {
  L1: { take: "L1TAKE", retake: "L1RETAKE" },
  L2: { take: "L2TAKE", retake: "L2RETAKE" },
  L3: { take: "L3TAKE", retake: "L3RETAKE" },
  L4: { take: "L4TAKE", retake: "L4RETAKE" },
  L5: { take: "L5TAKE", retake: "L5RETAKE" },
  L6: { take: "L6TAKE", retake: "L6RETAKE" },
  L7: { take: "L7TAKE", retake: "L7RETAKE" },
  L8: { take: "L8TAKE", retake: "L8RETAKE" },
  L9: { take: "L9TAKE", retake: "L9RETAKE" },
  L10: { take: "L10TAKE", retake: "L10RETAKE" },
  L11: { take: "L11TAKE", retake: "L11RETAKE" },
  L12: { take: "L12TAKE", retake: "L12RETAKE" },
  L13: { take: "L13TAKE", retake: "L13RETAKE" },
  L14: { take: "L14TAKE", retake: "L14RETAKE" },
  L15: { take: "L15TAKE", retake: "L15RETAKE" },
  L16: { take: "L16TAKE", retake: "L16RETAKE" }
};

// Page elements
const pages = {
  welcome: document.getElementById("welcome-page"),
  quiz: document.getElementById("quiz-page"),
  score: document.getElementById("score-page"),
  code: document.getElementById("code-page")
};

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const errorMsg = document.getElementById("error-message");

// Page navigation
function showPage(name) {
  Object.values(pages).forEach(p => p.style.display = "none");
  pages[name].style.display = "block";
}

// Load quiz based on entered code
function loadQuiz() {
  const inputCode = document.getElementById("code-input").value.trim().toUpperCase();
  let matchedLesson = null;

  for (const [lesson, codes] of Object.entries(lessonCodes)) {
    if (inputCode === codes.take) {
      matchedLesson = lesson;
      currentCodeType = "take";
      break;
    } else if (inputCode === codes.retake) {
      if (localStorage.getItem(lesson) === "done") {
        matchedLesson = lesson;
        currentCodeType = "retake";
        break;
      } else {
        errorMsg.textContent = "You must complete the lesson before retaking.";
        return;
      }
    }
  }

  if (!matchedLesson) {
    errorMsg.textContent = "Invalid code. Please try again.";
    return;
  }

  currentLesson = matchedLesson;
  fetchQuiz(matchedLesson);
}

// Fetch JSON file for lesson
function fetchQuiz(lesson) {
  fetch(`lesson${lesson.slice(1)}.json`)
    .then(res => res.json())
    .then(data => {
      quizData = data.questions;
      currentQuestion = 0;
      score = 0;
      errorMsg.textContent = "";
      showPage("quiz");
      loadQuestion();
    })
    .catch(() => {
      errorMsg.textContent = "Could not load quiz. Check file name or structure.";
    });
}

// Load individual question
function loadQuestion() {
  const q = quizData[currentQuestion];
  questionEl.textContent = `Q${currentQuestion + 1}: ${q.question}`;
  optionsEl.innerHTML = "";

  if (q.type === "mcq") {
    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.className = "btn option";
      btn.onclick = () => {
        if (opt.trim().toLowerCase() === q.answer.trim().toLowerCase()) score++;
        nextQuestion();
      };
      optionsEl.appendChild(btn);
    });
  } else if (q.type === "short" || q.type === "blank") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type your answer...";
    input.className = "code-input";
    optionsEl.appendChild(input);

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.className = "btn";
    submitBtn.onclick = () => {
      const userAns = input.value.trim().toLowerCase();
      if (userAns === q.answer.trim().toLowerCase()) score++;
      nextQuestion();
    };
    optionsEl.appendChild(submitBtn);
  } else if (q.type === "truefalse") {
    ["True", "False"].forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.className = "btn option";
      btn.onclick = () => {
        if (opt.toLowerCase() === q.answer.toLowerCase()) score++;
        nextQuestion();
      };
      optionsEl.appendChild(btn);
    });
  }
}

// Go to next question or finish
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
}

// Finish and show score
function finishQuiz() {
  scoreEl.textContent = `${score} / ${quizData.length}`;
  localStorage.setItem(currentLesson, "done");
  showPage("score");
}

// Retake logic
document.getElementById("retake-quiz-btn").addEventListener("click", () => {
  document.getElementById("code-input").value = "";
  errorMsg.textContent = "";
  showPage("code");
});

// Initial setup
window.onload = () => {
  showPage("code");
  document.getElementById("start-quiz-btn")?.addEventListener("click", () => showPage("code"));
  document.getElementById("submit-code-btn").addEventListener("click", loadQuiz);
};
