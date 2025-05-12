let quizData = [];
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

function loadQuiz() {
  const code = document.getElementById("lesson-code").value.trim();
  if (!code) return alert("Please enter a lesson code.");

  const lessonNum = code.match(/L\d{1,2}/)?.[0]; // Extract L1 to L16
  if (!lessonCodes[lessonNum]) {
    alert("Invalid lesson code.");
    return;
  }

  const savedStatus = localStorage.getItem(lessonNum);
  const isRetake = code === lessonCodes[lessonNum].retake;
  const isFirstTake = code === lessonCodes[lessonNum].take;

  if (savedStatus === "done" && !isRetake) {
    alert("You already completed this quiz. Use the retake code if allowed.");
    return;
  }

  if (!isFirstTake && !isRetake) {
    alert("Incorrect code for this lesson.");
    return;
  }

  currentLesson = lessonNum;
  fetchQuizData(lessonNum, code);
}

function fetchQuizData(lessonNum, codeUsed) {
  const lessonFile = `lesson${lessonNum.slice(1)}.json`;
  fetch(lessonFile)
    .then(res => {
      if (!res.ok) throw new Error("Lesson not found.");
      return res.json();
    })
    .then(data => {
      if (!data.code || data.code !== codeUsed) {
        alert("Lesson code does not match this file.");
        return;
      }
      quizData = data.questions;
      displayQuiz();
    })
    .catch(err => {
      alert("Error loading lesson: " + err.message);
    });
}

function displayQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  quizData.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<strong>Q${index + 1}: ${q.question}</strong><br>`;

    if (q.type === "mcq") {
      q.options.forEach((opt, i) => {
        div.innerHTML += `
          <label>
            <input type="radio" name="q${index}" value="${i}"> ${opt}
          </label><br>`;
      });
    } else if (q.type === "short" || q.type === "blank") {
      div.innerHTML += `<input type="text" name="q${index}" /><br>`;
    } else if (q.type === "truefalse") {
      div.innerHTML += `
        <label><input type="radio" name="q${index}" value="true"> True</label>
        <label><input type="radio" name="q${index}" value="false"> False</label><br>`;
    }

    container.appendChild(div);
  });

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit Quiz";
  submitBtn.onclick = submitQuiz;
  container.appendChild(submitBtn);
  container.classList.remove("hidden");
}

function submitQuiz() {
  let score = 0;

  quizData.forEach((q, i) => {
    const input = document.querySelector(`[name="q${i}"]:checked`) || document.querySelector(`[name="q${i}"]`);
    const userAnswer = input?.value?.trim();

    if (userAnswer != null) {
      if (q.type === "mcq" && parseInt(userAnswer) === q.answer) {
        score++;
      } else if ((q.type === "short" || q.type === "blank") && q.answer) {
        if (userAnswer.toLowerCase() === q.answer.toLowerCase()) {
          score++;
        }
      } else if (q.type === "truefalse" && String(q.answer) === userAnswer) {
        score++;
      }
    }
  });

  // Save completion status
  localStorage.setItem(currentLesson, "done");

  const container = document.getElementById("quiz-container");
  container.innerHTML = `<h2>You scored ${score} / ${quizData.length}</h2>`;
  
  const retakeBtn = document.createElement("button");
  retakeBtn.textContent = "Retake Quiz";
  retakeBtn.onclick = () => location.reload();
  container.appendChild(retakeBtn);
}
