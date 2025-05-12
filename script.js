let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let currentLessonKey = "";

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
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const nextButton = document.getElementById("next-btn");
const scoreDisplayElement = document.getElementById("score");
const codeInputElement = document.getElementById("code-input");
const submitCodeButton = document.getElementById("submit-code-btn");
const retakeQuizButton = document.getElementById("retake-quiz-btn");
const errorMessageElement = document.getElementById("error-message");
const startQuizButton = document.getElementById("start-quiz-btn");

// --- Event Listeners ---

startQuizButton.addEventListener("click", () => {
    showPage("code");
});

submitCodeButton.addEventListener("click", () => {
    submitCode();
});

nextButton.addEventListener("click", () => {
    nextQuestion();
});

retakeQuizButton.addEventListener("click", () => {
    retakeQuiz();
});

// --- Page Navigation Functions ---

function showPage(name) {
    welcomePage.style.display = name === "welcome" ? "block" : "none";
    codePage.style.display = name === "code" ? "block" : "none";
    quizPage.style.display = name === "quiz" ? "block" : "none";
    scorePage.style.display = name === "score" ? "block" : "none";
}

// --- Quiz Logic Functions ---

function loadQuiz(lessonKey, code) {
    fetch(`${lessonKey}.json`)
        .then(res => res.json())
        .then(data => {
            if (data.code !== code) {
                alert("Code does not match lesson file.");
                return;
            }
            quizData = data.questions;
            currentQuestionIndex = 0;
            score = 0;
            resetQuizState();
            showPage("quiz");
            showQuestion();
        })
        .catch((error) => {
            console.error("Error loading quiz:", error);
            alert("Error loading quiz data.");
        });
}

function showQuestion() {
    if (!isValidQuestionState()) return;

    const q = quizData[currentQuestionIndex];
    questionElement.textContent = `Q${currentQuestionIndex + 1}: ${q.question}`;
    optionsElement.innerHTML = "";
    nextButton.disabled = true; // Disable until an option is selected or input is given

    if (q.type === "mcq") {
        displayMCQOptions(q.options);
        const radioButtons = optionsElement.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                nextButton.disabled = false;
            });
        });
    } else if (q.type === "truefalse") {
        displayTrueFalseOptions();
        const radioButtons = optionsElement.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                nextButton.disabled = false;
            });
        });
    } else if (q.type === "short" || q.type === "blank") {
        displayTextInput();
        const answerInput = optionsElement.querySelector('input[name="quiz-option"]');
        if (answerInput) {
            answerInput.addEventListener('input', () => {
                nextButton.disabled = answerInput.value.trim() === "";
            });
        }
    }
}

function checkAnswer() {
    if (!isValidQuestionState()) return;

    const q = quizData[currentQuestionIndex];
    const userAnswer = getUserAnswer();
    const correctAnswer = getCorrectAnswer(q);
    let isCorrect = false;

    console.log("User Answer:", userAnswer);
    console.log("Correct Answer:", correctAnswer);

    if (q.type === "mcq" || q.type === "truefalse" || q.type === "blank") {
        isCorrect = userAnswer === correctAnswer;
    } else if (q.type === "short") {
        // Basic string comparison for short answers (can be improved)
        isCorrect = userAnswer === correctAnswer;
    }

    if (isCorrect) {
        score++;
        console.log("Score:", score);
    }

    provideFeedback(isCorrect, q.correctAnswer); // Use q.correctAnswer for display
    nextButton.disabled = false; // Enable next button after answering
}

function provideFeedback(isCorrect, correctAnswer) {
    let feedback = "";
    if (isCorrect) {
        feedback = "<span style='color: green;'>Correct!</span>";
    } else {
        feedback = `<span style='color: red;'>Incorrect.</span> The correct answer is: ${correctAnswer}`;
    }
    questionElement.innerHTML += `<br>${feedback}`; // Append feedback to question
}


function showScore() {
    localStorage.setItem(currentLessonKey, "done");
    scoreDisplayElement.textContent = `${score} / ${quizData.length}`;
    showPage("score");
}

// --- Helper/Utility Functions ---

function isValidQuestionState() {
    if (!quizData || quizData.length === 0 || currentQuestionIndex >= quizData.length) {
        console.error("Invalid quiz data or question index");
        return false;
    }
    return true;
}

function resetQuizState() {
    currentQuestionIndex = 0;
    score = 0;
    questionElement.innerHTML = ""; // Clear previous question and feedback
}

function getUserAnswer() {
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
        return selectedOption.value.trim().toLowerCase();
    } else {
        const textInput = document.querySelector('input[name="quiz-option"]');
        if (textInput) {
            return textInput ? textInput.value.trim().toLowerCase() : "";
        }
    }
    return ""; // Return an empty string if no answer is selected
}

function getCorrectAnswer(question) {
    if (question.type === "mcq") {
        return question.options[question.answer].toLowerCase();
    } else if (question.type === "truefalse") {
        return question.answer.toString(); // Convert boolean to string
    } else {
        return question.answer ? question.answer.toLowerCase() : ""; // Return "" if no answer
    }
}

function displayMCQOptions(options) {
    options.forEach((opt, index) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="quiz-option" value="${opt.toLowerCase()}" id="option${index}"> ${opt}`;
        optionsElement.appendChild(label);
    });
}

function displayTrueFalseOptions() {
    ["True", "False"].forEach(opt => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="quiz-option" value="${opt.toLowerCase()}"> ${opt}`;
        optionsElement.appendChild(label);
    });
}

function displayTextInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "quiz-option";
    input.placeholder = "Type your answer...";
    optionsElement.appendChild(input);
}

// --- User Interaction Handlers ---

function submitCode() {
    const code = codeInputElement.value.trim().toUpperCase();
    errorMessageElement.textContent = "";

    const lessonKey = Object.keys(lessonCodes).find(key =>
        code === lessonCodes[key].take || code === lessonCodes[key].retake
    );

    if (!lessonKey) {
        errorMessageElement.textContent = "Invalid code.";
        return;
    }

    const saved = localStorage.getItem(lessonKey);
    if (saved === "done" && code !== lessonCodes[lessonKey].retake) {
        errorMessageElement.textContent = "Retake code required.";
        return;
    }

    currentLessonKey = lessonKey;
    loadQuiz(lessonKey, code);
}

function nextQuestion() {
    console.log("--- Next Button Clicked ---");
    checkAnswer();
    nextButton.disabled = true; // Disable next button until the next question is displayed

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            showQuestion();
        } else {
            showScore();
        }
    }, 500); // Small delay to show feedback
}

function retakeQuiz() {
    codeInputElement.value = "";
    showPage("code");
}

// --- Initial Page Load ---
showPage("welcome");
