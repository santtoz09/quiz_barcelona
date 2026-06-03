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

const SESSION_STORAGE_KEY = "barcelonaQuizSession";
const RANKING_STORAGE_KEY = "barcelonaQuizRanking";

const loginScreen = document.getElementById("login");
const homeScreen = document.getElementById("home");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");

const loginForm = document.getElementById("loginForm");
const playerNameInput = document.getElementById("playerName");
const currentPlayerName = document.getElementById("currentPlayerName");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const questionBox = document.getElementById("questionBox");
const questionCounter = document.getElementById("questionCounter");
const questionTitle = document.getElementById("questionTitle");
const answersDiv = document.getElementById("answers");
const progressFill = document.getElementById("progressFill");
const scoreText = document.getElementById("scoreText");
const timerText = document.getElementById("timerText");
const finalTimeText = document.getElementById("finalTimeText");
const rankingList = document.getElementById("rankingList");

let playerName = "";
let questionNumber = 0;
let score = 0;
let canAnswer = true;
let selectedAnswers = [];
let elapsedTime = 0;
let timerStartedAt = null;
let timerInterval = null;
let nextQuestionTimeout = null;

function showScreen(screen) {
  loginScreen.classList.remove("active");
  homeScreen.classList.remove("active");
  quizScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  screen.classList.add("active");
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return minutes + ":" + seconds;
}

function getCurrentElapsedTime() {
  if (timerStartedAt === null) {
    return elapsedTime;
  }

  return elapsedTime + Date.now() - timerStartedAt;
}

function updateTimerText() {
  timerText.textContent = "Tempo: " + formatTime(getCurrentElapsedTime());
}

function startTimer() {
  stopTimer();
  timerStartedAt = Date.now();
  updateTimerText();
  timerInterval = setInterval(function () {
    updateTimerText();
    saveSession();
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (timerStartedAt !== null) {
    elapsedTime += Date.now() - timerStartedAt;
    timerStartedAt = null;
  }
}

function saveSession() {
  if (!playerName || !quizScreen.classList.contains("active")) {
    return;
  }

  const sessionData = {
    playerName,
    questionNumber,
    selectedAnswers,
    score,
    elapsedTime: getCurrentElapsedTime(),
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
}

function loadSession() {
  const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!savedSession) {
    return null;
  }

  try {
    const sessionData = JSON.parse(savedSession);

    if (
      typeof sessionData.playerName !== "string" ||
      typeof sessionData.questionNumber !== "number" ||
      !Array.isArray(sessionData.selectedAnswers) ||
      typeof sessionData.score !== "number" ||
      typeof sessionData.elapsedTime !== "number"
    ) {
      return null;
    }

    return sessionData;
  } catch (error) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function getRanking() {
  const savedRanking = localStorage.getItem(RANKING_STORAGE_KEY);

  if (!savedRanking) {
    return [];
  }

  try {
    const ranking = JSON.parse(savedRanking);
    return Array.isArray(ranking) ? ranking : [];
  } catch (error) {
    localStorage.removeItem(RANKING_STORAGE_KEY);
    return [];
  }
}

function saveRanking(ranking) {
  localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(ranking));
}

function addRankingEntry() {
  const ranking = getRanking();

  ranking.push({
    name: playerName,
    score,
    total: questions.length,
    elapsedTime,
    date: new Date().toISOString(),
  });

  ranking.sort(function (first, second) {
    if (second.score !== first.score) {
      return second.score - first.score;
    }

    return first.elapsedTime - second.elapsedTime;
  });

  saveRanking(ranking);
  renderRanking(ranking);
}

function renderRanking(ranking = getRanking()) {
  rankingList.innerHTML = "";

  if (ranking.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "Nenhuma pontuação registrada ainda.";
    rankingList.appendChild(emptyItem);
    return;
  }

  for (let i = 0; i < ranking.length; i++) {
    const item = document.createElement("li");
    item.textContent =
      ranking[i].name + " - " + ranking[i].score + "/" + ranking[i].total + " - " + formatTime(ranking[i].elapsedTime);
    rankingList.appendChild(item);
  }
}

function restoreSession(sessionData) {
  playerName = sessionData.playerName.trim();
  questionNumber = Math.min(Math.max(sessionData.questionNumber, 0), questions.length - 1);
  selectedAnswers = sessionData.selectedAnswers.slice(0, questions.length);
  score = sessionData.score;
  elapsedTime = sessionData.elapsedTime;
  currentPlayerName.textContent = playerName;
  showScreen(quizScreen);
  startTimer();
  showQuestion();

  if (selectedAnswers[questionNumber] !== undefined) {
    nextQuestionTimeout = setTimeout(nextQuestion, 850);
  }
}

function startQuiz() {
  if (nextQuestionTimeout !== null) {
    clearTimeout(nextQuestionTimeout);
    nextQuestionTimeout = null;
  }

  questionNumber = 0;
  score = 0;
  selectedAnswers = [];
  elapsedTime = 0;
  currentPlayerName.textContent = playerName;
  showScreen(quizScreen);
  startTimer();
  showQuestion();
  saveSession();
}

function showQuestion() {
  canAnswer = selectedAnswers[questionNumber] === undefined;

  const question = questions[questionNumber];
  questionCounter.textContent = "Pergunta " + (questionNumber + 1) + " de " + questions.length;
  questionTitle.textContent = question.title;
  const questionWasAnswered = selectedAnswers[questionNumber] !== undefined;
  progressFill.style.width = ((questionWasAnswered ? questionNumber + 1 : questionNumber) / questions.length) * 100 + "%";
  updateTimerText();

  answersDiv.innerHTML = "";

  for (let i = 0; i < question.answers.length; i++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = question.answers[i];
    button.onclick = function () {
      checkAnswer(button, i);
    };

    if (selectedAnswers[questionNumber] !== undefined) {
      button.disabled = true;
      if (i === question.correct) {
        button.classList.add("correct");
      } else if (i === selectedAnswers[questionNumber]) {
        button.classList.add("wrong");
      }
    }

    answersDiv.appendChild(button);
  }
}

function checkAnswer(selectedButton, answerNumber) {
  if (!canAnswer) {
    return;
  }

  canAnswer = false;
  selectedAnswers[questionNumber] = answerNumber;

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

    if (i === question.correct) {
      buttons[i].classList.add("correct");
    }
  }

  progressFill.style.width = ((questionNumber + 1) / questions.length) * 100 + "%";
  saveSession();

  nextQuestionTimeout = setTimeout(nextQuestion, 850);
}

function nextQuestion() {
  nextQuestionTimeout = null;

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
    saveSession();

    setTimeout(function () {
      questionBox.classList.remove("entering");
    }, 550);
  }, 450);
}

function finishQuiz() {
  stopTimer();
  scoreText.textContent = score + "/" + questions.length;
  finalTimeText.textContent = "Tempo: " + formatTime(elapsedTime);
  addRankingEntry();
  clearSession();
  showScreen(resultScreen);
}

loginForm.onsubmit = function (event) {
  event.preventDefault();
  const typedName = playerNameInput.value.trim();

  if (!typedName) {
    playerNameInput.focus();
    return;
  }

  playerName = typedName;
  currentPlayerName.textContent = playerName;
  showScreen(homeScreen);
};

startButton.onclick = startQuiz;
restartButton.onclick = function () {
  clearSession();
  showScreen(loginScreen);
  playerNameInput.value = "";
  playerNameInput.focus();
};

window.addEventListener("beforeunload", saveSession);

const savedSession = loadSession();
if (savedSession) {
  restoreSession(savedSession);
} else {
  showScreen(loginScreen);
}
