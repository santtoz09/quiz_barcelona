const questions = [
  {
    title: "Em que ano o Barcelona foi fundado?",
    answers: ["1899", "1905", "1912", "1888"],
    correctIndex: 0,
  },
  {
    title: "Contra qual rival acontece o clássico chamado “El Clásico”?",
    answers: ["Atlético de Madrid", "Sevilla FC", "Real Madrid CF", "Valencia CF"],
    correctIndex: 2,
  },
  {
    title: "Qual jogador brasileiro ganhou a Champions League pelo Barça em 2006 e 2015?",
    answers: ["Neymar", "Ronaldinho", "Rivaldo", "Dani Alves"],
    correctIndex: 3,
  },
  {
    title: "Qual lema famoso do clube significa “mais que um clube”?",
    answers: ["Visca Barça", "Més que un club", "Força Catalunya", "Blaugrana Forever"],
    correctIndex: 1,
  },
  {
    title: "Quem é conhecido como um dos maiores treinadores da história do Barça e criou o “tiki-taka”?",
    answers: ["Johan Cruyff", "Diego Simeone", "Carlo Ancelotti", "Jurgen Klopp"],
    correctIndex: 0,
  },
];

const homeScreen = document.querySelector("#home");
const quizScreen = document.querySelector("#quiz");
const resultScreen = document.querySelector("#result");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const questionCard = document.querySelector("#questionCard");
const questionCounter = document.querySelector("#questionCounter");
const questionTitle = document.querySelector("#questionTitle");
const answersContainer = document.querySelector("#answers");
const progressFill = document.querySelector("#progressFill");
const scoreText = document.querySelector("#scoreText");

let currentQuestion = 0;
let score = 0;
let locked = false;

function showScreen(screen) {
  [homeScreen, quizScreen, resultScreen].forEach((item) => {
    item.classList.toggle("is-active", item === screen);
  });
}

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion({ entering = false } = {}) {
  locked = false;
  const question = questions[currentQuestion];

  questionCounter.textContent = `Pergunta ${currentQuestion + 1} de ${questions.length}`;
  questionTitle.textContent = question.title;
  progressFill.style.width = `${(currentQuestion / questions.length) * 100}%`;

  answersContainer.innerHTML = "";
  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => selectAnswer(button, index));
    answersContainer.append(button);
  });

  if (entering) {
    questionCard.classList.remove("is-leaving");
    questionCard.classList.add("is-entering");
    questionCard.addEventListener("animationend", () => questionCard.classList.remove("is-entering"), { once: true });
  }
}

function selectAnswer(selectedButton, selectedIndex) {
  if (locked) return;
  locked = true;

  const question = questions[currentQuestion];
  const isCorrect = selectedIndex === question.correctIndex;
  if (isCorrect) score += 1;

  [...answersContainer.children].forEach((button, index) => {
    button.disabled = true;
    if (index === selectedIndex) {
      button.classList.add(isCorrect ? "is-correct" : "is-wrong");
    }
  });

  progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

  window.setTimeout(() => {
    if (currentQuestion === questions.length - 1) {
      finishQuiz();
      return;
    }

    questionCard.classList.remove("is-entering");
    questionCard.classList.add("is-leaving");
    questionCard.addEventListener(
      "animationend",
      () => {
        currentQuestion += 1;
        renderQuestion({ entering: true });
      },
      { once: true },
    );
  }, 850);
}

function finishQuiz() {
  scoreText.textContent = `${score}/${questions.length}`;
  showScreen(resultScreen);
}

startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", startQuiz);
