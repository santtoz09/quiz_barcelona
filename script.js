const questions = [
  { title: "Em que ano o Barcelona foi fundado?", answers: ["1899", "1905", "1912", "1888"], correct: 0 },
  { title: "Contra qual rival acontece o clássico chamado \"El Clásico\"?", answers: ["Atlético de Madrid", "Sevilla FC", "Real Madrid CF", "Valencia CF"], correct: 2 },
  { title: "Qual jogador brasileiro ganhou a Champions League pelo Barça em 2006 e 2015?", answers: ["Neymar", "Ronaldinho", "Rivaldo", "Dani Alves"], correct: 3 },
  { title: "Qual lema famoso do clube significa \"mais que um clube\"?", answers: ["Visca Barça", "Més que un club", "Força Catalunya", "Blaugrana Forever"], correct: 1 },
  { title: "Quem é conhecido como um dos maiores treinadores da história do Barça e criou o \"tiki-taka\"?", answers: ["Johan Cruyff", "Diego Simeone", "Carlo Ancelotti", "Jurgen Klopp"], correct: 0 }
];

let playerName = "";
let questionNumber = 0;
let score = 0;
let canAnswer = true;
let selectedAnswers = [];
let elapsedTime = 0;
let timerStartedAt = null;
let timerInterval = null;
let nextQuestionTimeout = null;

const el = {
  login: document.getElementById("login"),
  home: document.getElementById("home"),
  quiz: document.getElementById("quiz"),
  result: document.getElementById("result"),
  loginForm: document.getElementById("loginForm"),
  playerNameInput: document.getElementById("playerName"),
  currentPlayerName: document.getElementById("currentPlayerName"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
  questionBox: document.getElementById("questionBox"),
  questionCounter: document.getElementById("questionCounter"),
  questionTitle: document.getElementById("questionTitle"),
  answersDiv: document.getElementById("answers"),
  progressFill: document.getElementById("progressFill"),
  scoreText: document.getElementById("scoreText"),
  timerText: document.getElementById("timerText"),
  finalTimeText: document.getElementById("finalTimeText"),
  rankingList: document.getElementById("rankingList")
};

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return minutes + ":" + seconds;
}

function getCurrentElapsedTime() {
  if (timerStartedAt === null) return elapsedTime;
  return elapsedTime + Date.now() - timerStartedAt;
}

function updateTimerText() {
  el.timerText.textContent = "Tempo: " + formatTime(getCurrentElapsedTime());
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
  if (timerInterval !== null) clearInterval(timerInterval);
  timerInterval = null;
  if (timerStartedAt !== null) {
    elapsedTime += Date.now() - timerStartedAt;
    timerStartedAt = null;
  }
}

function saveSession() {
  if (!playerName || !el.quiz.classList.contains("active")) return;
  const data = { playerName, questionNumber, selectedAnswers, score, elapsedTime: getCurrentElapsedTime() };
  localStorage.setItem("session", JSON.stringify(data));
}

function loadSession() {
  const saved = localStorage.getItem("session");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return null;
  }
}

function getRanking() {
  const saved = localStorage.getItem("ranking");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

function saveRanking(ranking) {
  localStorage.setItem("ranking", JSON.stringify(ranking));
}

function renderRanking() {
  const ranking = getRanking();
  el.rankingList.innerHTML = "";
  
  if (ranking.length === 0) {
    el.rankingList.innerHTML = "<li>Nenhuma pontuação registrada ainda.</li>";
    return;
  }
  
  ranking.forEach(function(r) {
    const li = document.createElement("li");
    li.textContent = r.name + " - " + r.score + "/" + r.total + " - " + formatTime(r.elapsedTime);
    el.rankingList.appendChild(li);
  });
}

function showScreen(screen) {
  el.login.classList.remove("active");
  el.home.classList.remove("active");
  el.quiz.classList.remove("active");
  el.result.classList.remove("active");
  screen.classList.add("active");
}

function showQuestion() {
  canAnswer = selectedAnswers[questionNumber] === undefined;
  const question = questions[questionNumber];
  const answered = selectedAnswers[questionNumber] !== undefined;
  
  el.questionCounter.textContent = "Pergunta " + (questionNumber + 1) + " de " + questions.length;
  el.questionTitle.textContent = question.title;
  el.progressFill.style.width = ((answered ? questionNumber + 1 : questionNumber) / questions.length) * 100 + "%";
  updateTimerText();
  
  el.answersDiv.innerHTML = "";
  
  for (let i = 0; i < question.answers.length; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-button";
    btn.textContent = question.answers[i];
    btn.disabled = answered;
    
    if (answered) {
      if (i === question.correct) btn.classList.add("correct");
      if (i === selectedAnswers[questionNumber]) btn.classList.add("wrong");
    }
    
    btn.onclick = function() {
      checkAnswer(btn, i);
    };
    
    el.answersDiv.appendChild(btn);
  }
}

function checkAnswer(btn, answerNumber) {
  if (!canAnswer) return;
  
  canAnswer = false;
  selectedAnswers[questionNumber] = answerNumber;
  const question = questions[questionNumber];
  const isCorrect = answerNumber === question.correct;
  
  if (isCorrect) score++;
  
  btn.classList.add(isCorrect ? "correct" : "wrong");
  
  const allBtns = document.querySelectorAll(".answer-button");
  for (let i = 0; i < allBtns.length; i++) {
    allBtns[i].disabled = true;
    if (i === question.correct) allBtns[i].classList.add("correct");
  }
  
  el.progressFill.style.width = ((questionNumber + 1) / questions.length) * 100 + "%";
  saveSession();
  
  nextQuestionTimeout = setTimeout(nextQuestion, 850);
}

function nextQuestion() {
  nextQuestionTimeout = null;
  
  if (questionNumber === questions.length - 1) {
    finishQuiz();
    return;
  }
  
  el.questionBox.classList.add("leaving");
  
  setTimeout(function() {
    questionNumber++;
    el.questionBox.classList.remove("leaving");
    el.questionBox.classList.add("entering");
    showQuestion();
    saveSession();
    
    setTimeout(function() {
      el.questionBox.classList.remove("entering");
    }, 550);
  }, 450);
}

function finishQuiz() {
  stopTimer();
  el.scoreText.textContent = score + "/" + questions.length;
  el.finalTimeText.textContent = "Tempo: " + formatTime(elapsedTime);
  
  const ranking = getRanking();
  ranking.push({
    name: playerName,
    score: score,
    total: questions.length,
    elapsedTime: elapsedTime,
    date: new Date().toISOString()
  });
  
  ranking.sort(function(a, b) {
    if (a.score !== b.score) return b.score - a.score;
    return a.elapsedTime - b.elapsedTime;
  });
  
  saveRanking(ranking);
  renderRanking();
  localStorage.removeItem("session");
  showScreen(el.result);
}

function startQuiz() {
  if (nextQuestionTimeout !== null) clearTimeout(nextQuestionTimeout);
  nextQuestionTimeout = null;
  
  questionNumber = 0;
  score = 0;
  selectedAnswers = [];
  elapsedTime = 0;
  
  el.currentPlayerName.textContent = playerName;
  showScreen(el.quiz);
  startTimer();
  showQuestion();
  saveSession();
}

function restoreSession(sessionData) {
  playerName = sessionData.playerName.trim();
  questionNumber = Math.min(Math.max(sessionData.questionNumber, 0), questions.length - 1);
  selectedAnswers = sessionData.selectedAnswers.slice(0, questions.length);
  score = sessionData.score;
  elapsedTime = sessionData.elapsedTime;
  
  el.currentPlayerName.textContent = playerName;
  showScreen(el.quiz);
  startTimer();
  showQuestion();
  
  if (selectedAnswers[questionNumber] !== undefined) {
    nextQuestionTimeout = setTimeout(nextQuestion, 850);
  }
}

// Event Listeners
el.loginForm.onsubmit = function(e) {
  e.preventDefault();
  const name = el.playerNameInput.value.trim();
  if (!name) {
    el.playerNameInput.focus();
    return;
  }
  playerName = name;
  el.currentPlayerName.textContent = playerName;
  showScreen(el.home);
};

el.startButton.onclick = startQuiz;

el.restartButton.onclick = function() {
  localStorage.removeItem("session");
  showScreen(el.login);
  el.playerNameInput.value = "";
  el.playerNameInput.focus();
};

window.addEventListener("beforeunload", saveSession);

// Inicialização
const saved = loadSession();
if (saved) {
  restoreSession(saved);
} else {
  showScreen(el.login);
}