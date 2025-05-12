let quizData = [];
let currentLesson = "";
let currentQuestionIndex = 0;
let score = 0;

const lessonCodes = {
  L1: { take: "L1TAKE", retake: "L1RETAKE" },
  L2: { take: "L2TAKE", retake: "L2RETAKE" },
  // Add more lessons as needed
};

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

function loadQuiz() {
  const code = document.getElementById("lesson-code").value.trim();
  const lessonKey = code.slice(0, 2).toUpperCase();

  if (!lessonCodes[lessonKey]) {
    document.getElementById("error-message").textContent = "Invalid lesson code.";
    return;
  }

  const local = localStorage.getItem(lessonKey);

  if (local === "done") {
    if (code === lessonCodes[lessonKey].retake) {
      alert("Retake allowed.");
    } else {
      alert("Retake code required.");
      return;
    }
  } else if (code !== lessonCodes[lessonKey].take) {
    alert("Invalid take code.");
    return;
  }

  fetch(`lesson${lessonKey.slice(1)}.json`)
    .then(res => res.json())
    .then(data => {
      if (!data || !Array.isArray(data.questions)) {
        alert("Invalid lesson file.");
        return;
      }
      quizData = data.questions;
      currentLesson = lessonKey;
      currentQuestionIndex = 0;
      score = 0;
      showPage("quiz-page");
      loadQuestion();
    })
    .catch(() => alert("Lesson JSON file not found."));
}

function loadQuestion() {
  const q = quizData[currentQuestionIndex];
  document.getElementById("question").textContent = `Q${currentQuestionIndex + 1}: ${q.question}`;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  if (q.type === "mcq") {
    q.options.forEach((opt, i) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="radio" name="option" value="${opt}" /> ${opt}`;
      optionsDiv.appendChild(label);
    });
  } else {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "answer-input";
    input.placeholder = "Type your answer...";
    optionsDiv.appendChild(input);
  }

  document.getElementById("next-btn").onclick = nextQuestion;
}

function nextQuestion() {
  const q = quizData[currentQuestionIndex];
  let userAnswer = "";

  if (q.type === "mcq") {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) {
      alert("Please select an option.");
      return;
    }
    userAnswer = selected.value;
  } else {
    userAnswer = document.getElementById("answer-input").value.trim();
    if (!userAnswer) {
      alert("Please enter an answer.");
      return;
    }
  }

  if (userAnswer.toLowerCase() === q.answer.toLowerCase()) {
    score++;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    showScore();
  }
}

function showScore() {
  document.getElementById("score").textContent = `${score} / ${quizData.length}`;
  showPage("score-page");
  localStorage.setItem(currentLesson, "done");
}

function submitRetakeCode() {
  const retakeCode = document.getElementById("retake-code").value.trim();
  const valid = Object.entries(lessonCodes).find(
    ([key, val]) => val.retake === retakeCode
  );
  if (valid) {
    localStorage.removeItem(valid[0]);
    alert("You can now retake the quiz.");
    showPage("code-page");
  } else {
    alert("Invalid retake code.");
  }
}

function resetToCodePage() {
  showPage("code-page");
}

window.onload = () => {
  showPage("code-page");
};
