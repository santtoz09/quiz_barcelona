const questions = [
  {
    title: "Em que ano o Barcelona foi fundado?",
    answers: ["1899", "1905", "1912", "1888"],
    correct: 0,
  },
  {
    title: "Contra qual rival acontece o clássico chamado “El Clásico”?",
    answers: ["Atlético de Madrid", "Sevilla FC", "Real Madrid CF", "Valencia CF"],
    correct: 2,
  },
  {
    title: "Qual jogador brasileiro ganhou a Champions League pelo Barça em 2006 e 2015?",
    answers: ["Neymar", "Ronaldinho", "Rivaldo", "Dani Alves"],
    correct: 3,
  },
  {
    title: "Qual lema famoso do clube significa “mais que um clube”?",
    answers: ["Visca Barça", "Més que un club", "Força Catalunya", "Blaugrana Forever"],
    correct: 1,
  },
  {
    title: "Quem é conhecido como um dos maiores treinadores da história do Barça e criou o “tiki-taka”?",
    answers: ["Johan Cruyff", "Diego Simeone", "Carlo Ancelotti", "Jurgen Klopp"],
    correct: 0,
  },
];

const homeScreen = document.getElementById("home");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const questionBox = document.getElementById("questionBox");
const questionCounter = document.getElementById("questionCounter");
const questionTitle = document.getElementById("questionTitle");
const answersDiv = document.getElementById("answers");
const progressFill = document.getElementById("progressFill");
const scoreText = document.getElementById("scoreText");

let questionNumber = 0;
let score = 0;
let canAnswer = true;

function showScreen(screen) {
  homeScreen.classList.remove("active");
  quizScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  screen.classList.add("active");
}

function startQuiz() {
  questionNumber = 0;
  score = 0;
  showScreen(quizScreen);
  showQuestion();
}

function showQuestion() {
  canAnswer = true;

  const question = questions[questionNumber];
  questionCounter.textContent = "Pergunta " + (questionNumber + 1) + " de " + questions.length;
  questionTitle.textContent = question.title;
  progressFill.style.width = (questionNumber / questions.length) * 100 + "%";

  answersDiv.innerHTML = "";

  for (let i = 0; i < question.answers.length; i++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = question.answers[i];
    button.onclick = function () {
      checkAnswer(button, i);
    };

    answersDiv.appendChild(button);
  }
}

function checkAnswer(selectedButton, answerNumber) {
  if (!canAnswer) {
    return;
  }

  canAnswer = false;

  const question = questions[questionNumber];
  const isCorrect = answerNumber === question.correct;

  if (isCorrect) {
    score++;
    selectedButton.classList.add("correct");
  } else {
    selectedButton.classList.add("wrong");
  }

  const buttons = document.querySelectorAll(".answer-button");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }

  progressFill.style.width = ((questionNumber + 1) / questions.length) * 100 + "%";

  setTimeout(nextQuestion, 850);
}

function nextQuestion() {
  if (questionNumber === questions.length - 1) {
    finishQuiz();
    return;
  }

  questionBox.classList.add("leaving");

  setTimeout(function () {
    questionNumber++;
    questionBox.classList.remove("leaving");
    questionBox.classList.add("entering");
    showQuestion();

    setTimeout(function () {
      questionBox.classList.remove("entering");
    }, 550);
  }, 450);
}

function finishQuiz() {
  scoreText.textContent = score + "/" + questions.length;
  showScreen(resultScreen);
}

startButton.onclick = startQuiz;
restartButton.onclick = startQuiz;
