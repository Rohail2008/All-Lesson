let quizData = [];
let currentLesson = "";
let lessonCodes = {
  "L1": {
    "take": "L1TAKE",  // Lesson 1 Take Code
    "retake": "L1RETAKE" // Lesson 1 Retake Code
  },
  "L2": {
    "take": "L2TAKE",  // Lesson 2 Take Code
    "retake": "L2RETAKE" // Lesson 2 Retake Code
  },
  "L3": {
    "take": "L3TAKE",  // Lesson 3 Take Code
    "retake": "L3RETAKE" // Lesson 3 Retake Code
  },
  "L4": {
    "take": "L4TAKE",  // Lesson 4 Take Code
    "retake": "L4RETAKE" // Lesson 4 Retake Code
  },
  "L5": {
    "take": "L5TAKE",  // Lesson 5 Take Code
    "retake": "L5RETAKE" // Lesson 5 Retake Code
  },
  "L6": {
    "take": "L6TAKE",  // Lesson 6 Take Code
    "retake": "L6RETAKE" // Lesson 6 Retake Code
  },
  "L7": {
    "take": "L7TAKE",  // Lesson 7 Take Code
    "retake": "L7RETAKE" // Lesson 7 Retake Code
  },
  "L8": {
    "take": "L8TAKE",  // Lesson 8 Take Code
    "retake": "L8RETAKE" // Lesson 8 Retake Code
  },
  "L9": {
    "take": "L9TAKE",  // Lesson 9 Take Code
    "retake": "L9RETAKE" // Lesson 9 Retake Code
  },
  "L10": {
    "take": "L10TAKE", // Lesson 10 Take Code
    "retake": "L10RETAKE" // Lesson 10 Retake Code
  },
  "L11": {
    "take": "L11TAKE", // Lesson 11 Take Code
    "retake": "L11RETAKE" // Lesson 11 Retake Code
  },
  "L12": {
    "take": "L12TAKE", // Lesson 12 Take Code
    "retake": "L12RETAKE" // Lesson 12 Retake Code
  },
  "L13": {
    "take": "L13TAKE", // Lesson 13 Take Code
    "retake": "L13RETAKE" // Lesson 13 Retake Code
  },
  "L14": {
    "take": "L14TAKE", // Lesson 14 Take Code
    "retake": "L14RETAKE" // Lesson 14 Retake Code
  },
  "L15": {
    "take": "L15TAKE", // Lesson 15 Take Code
    "retake": "L15RETAKE" // Lesson 15 Retake Code
  },
  "L16": {
    "take": "L16TAKE", // Lesson 16 Take Code
    "retake": "L16RETAKE" // Lesson 16 Retake Code
  }
};

// Function to load the quiz based on the entered code
function loadQuiz() {
  const code = document.getElementById("lesson-code").value.trim();
  if (!code) return alert("Please enter a lesson code.");

  // Match the code to the lesson number (L1 to L16)
  const lessonNum = code.slice(0, 2);
  if (!lessonCodes[lessonNum]) {
    alert("Invalid lesson code.");
    return;
  }

  // Check if it's a retake attempt
  const savedCode = localStorage.getItem(lessonNum);
  if (savedCode === "done") {
    if (code === lessonCodes[lessonNum].retake) {
      alert("You can now retake the quiz.");
      fetchQuizData(lessonNum);  // Load quiz data again for retake
    } else {
      alert("You need the correct retake code to retake the quiz.");
      return;
    }
  } else if (savedCode === null) {
    // First time taking the quiz
    if (code === lessonCodes[lessonNum].take) {
      fetchQuizData(lessonNum);
    } else {
      alert("Incorrect take code for this lesson.");
    }
  }
}

// Function to fetch quiz data based on lesson number
function fetchQuizData(lessonNum) {
  // Correct path for JSON files (e.g., lesson1.json, lesson2.json, etc.)
  fetch(`lesson${lessonNum.slice(1)}.json`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Lesson not found");
      }
      return res.json();
    })
    .then(data => {
      // Ensure the code matches
      if (!data.code || data.code !== lessonCodes[lessonNum].take) {
        alert("Incorrect take code for this lesson.");
        return;
      }
      quizData = data.questions;
      currentLesson = lessonCodes[lessonNum].take;
      displayQuiz();
    })
    .catch(error => alert("Lesson not found. Ensure the JSON files are correctly named (lesson1.json, lesson2.json, etc.)."));
}

// Function to display the quiz based on the data
function displayQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  quizData.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<strong>Q${index + 1}: ${q.question}</strong>`;

    // Display multiple choice questions
    if (q.type === "mcq") {
      const options = q.options.map((opt, i) => `
        <label><input type="radio" name="q${index}" value="${i}"> ${opt}</label>`).join("");
      div.innerHTML += `<div class="options">${options}</div>`;
    } 
    // Display short answer questions
    else if (q.type === "short" || q.type === "blank") {
      div.innerHTML += `<div class="options"><input type="text" name="q${index}" /></div>`;
    }
    // Display true/false questions
    else if (q.type === "truefalse") {
      div.innerHTML += `
        <div class="options">
          <label><input type="radio" name="q${index}" value="true"> True</label>
          <label><input type="radio" name="q${index}" value="false"> False</label>
        </div>`;
    }

    container.appendChild(div);
  });

  // Submit Button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit Quiz";
  submitBtn.onclick = () => {
    const score = calculateScore();
    localStorage.setItem(currentLesson, "done");
    alert(`Quiz submitted! Your score is: ${score}/${quizData.length}`);
    // Disable quiz after submission
    submitBtn.disabled = true;
  };
  container.appendChild(submitBtn);
  container.classList.remove("hidden");
}

// Function to calculate score based on answers
function calculateScore() {
  let score = 0;

  quizData.forEach((q, index) => {
    const userAnswer = document.querySelector(`input[name="q${index}"]:checked`);
    const userInput = document.querySelector(`input[name="q${index}"]`).value.trim().toLowerCase();

    // Check for multiple choice and true/false questions
    if (q.type === "mcq" && userAnswer && parseInt(userAnswer.value) === q.answer) {
      score++;
    } 
    // Check for blank and short answer questions
    else if ((q.type === "blank" || q.type === "short") && userInput === q.answer.toLowerCase()) {
      score++;
    }
    // Check for true/false questions
    else if (q.type === "truefalse" && userAnswer && userAnswer.value === String(q.answer)) {
      score++;
    }
  });

  return score;
}
