const perguntas = [
  { titulo: "Em que ano o Barcelona foi fundado?", respostas: ["1899", "1905", "1912", "1888"], correta: 0 },
  { titulo: "Contra qual rival acontece o clássico chamado \"El Clásico\"?", respostas: ["Atlético de Madrid", "Sevilla FC", "Real Madrid CF", "Valencia CF"], correta: 2 },
  { titulo: "Qual jogador brasileiro ganhou a Champions League pelo Barça em 2006 e 2015?", respostas: ["Neymar", "Ronaldinho", "Rivaldo", "Dani Alves"], correta: 3 },
  { titulo: "Qual lema famoso do clube significa \"mais que um clube\"?", respostas: ["Visca Barça", "Més que un club", "Força Catalunya", "Blaugrana Forever"], correta: 1 },
  { titulo: "Quem é conhecido como um dos maiores treinadores da história do Barça e criou o \"tiki-taka\"?", respostas: ["Johan Cruyff", "Diego Simeone", "Carlo Ancelotti", "Jurgen Klopp"], correta: 0 }
];

let nomeJogador = "";
let numeroPerguntas = 0;
let pontuacao = 0;
let podResponder = true;
let respostasEscolhidas = [];
let tempoDecorrido = 0;
let inicioTimer = null;
let intervaloTimer = null;
let timeoutProximaPergunta = null;

const elementos = {
  telaLogin: document.getElementById("tela-login"),
  telaInicio: document.getElementById("tela-inicio"),
  telaQuiz: document.getElementById("tela-quiz"),
  telaResultado: document.getElementById("tela-resultado"),
  formLogin: document.getElementById("form-login"),
  nomeJogadorInput: document.getElementById("nomeJogador"),
  nomeJogadorAtual: document.getElementById("nomeJogadorAtual"),
  botaoIniciar: document.getElementById("botao-iniciar"),
  botaoReiniciar: document.getElementById("botao-reiniciar"),
  caixaPergunta: document.getElementById("caixa-pergunta"),
  contadorPergunta: document.getElementById("contador-pergunta"),
  tituloPergunta: document.getElementById("titulo-pergunta"),
  respostasDiv: document.getElementById("respostas"),
  preenchimentoProgresso: document.getElementById("preenchimento-progresso"),
  textoPontuacao: document.getElementById("texto-pontuacao"),
  textoTempo: document.getElementById("texto-tempo"),
  textoTempoFinal: document.getElementById("texto-tempo-final"),
  listaRanking: document.getElementById("lista-ranking")
};

function formatarTempo(ms) {
  const totalSegundos = Math.floor(ms / 1000);
  const minutos = String(Math.floor(totalSegundos / 60)).padStart(2, "0");
  const segundos = String(totalSegundos % 60).padStart(2, "0");
  return minutos + ":" + segundos;
}

function obterTempoDecorrido() {
  if (inicioTimer === null) return tempoDecorrido;
  return tempoDecorrido + Date.now() - inicioTimer;
}

function atualizarTextoTempo() {
  elementos.textoTempo.textContent = "Tempo: " + formatarTempo(obterTempoDecorrido());
}

function iniciarTimer() {
  pararTimer();
  inicioTimer = Date.now();
  atualizarTextoTempo();
  intervaloTimer = setInterval(function () {
    atualizarTextoTempo();
    salvarSessao();
  }, 1000);
}

function pararTimer() {
  if (intervaloTimer !== null) clearInterval(intervaloTimer);
  intervaloTimer = null;
  if (inicioTimer !== null) {
    tempoDecorrido += Date.now() - inicioTimer;
    inicioTimer = null;
  }
}

function salvarSessao() {
  if (!nomeJogador || !elementos.telaQuiz.classList.contains("ativa")) return;
  const dados = { nomeJogador, numeroPerguntas, respostasEscolhidas, pontuacao, tempoDecorrido: obterTempoDecorrido() };
  localStorage.setItem("sessao", JSON.stringify(dados));
}

function carregarSessao() {
  const salvo = localStorage.getItem("sessao");
  if (!salvo) return null;
  try {
    return JSON.parse(salvo);
  } catch (e) {
    return null;
  }
}

function obterRanking() {
  const salvo = localStorage.getItem("ranking");
  if (!salvo) return [];
  try {
    return JSON.parse(salvo);
  } catch (e) {
    return [];
  }
}

function salvarRanking(ranking) {
  localStorage.setItem("ranking", JSON.stringify(ranking));
}

function renderizarRanking() {
  const ranking = obterRanking();
  elementos.listaRanking.innerHTML = "";
  
  if (ranking.length === 0) {
    elementos.listaRanking.innerHTML = "<li>Nenhuma pontuação registrada ainda.</li>";
    return;
  }
  
  ranking.forEach(function(r) {
    const li = document.createElement("li");
    li.textContent = r.nome + " - " + r.pontuacao + "/" + r.total + " - " + formatarTempo(r.tempoDecorrido);
    elementos.listaRanking.appendChild(li);
  });
}

function exibirTela(tela) {
  elementos.telaLogin.classList.remove("ativa");
  elementos.telaInicio.classList.remove("ativa");
  elementos.telaQuiz.classList.remove("ativa");
  elementos.telaResultado.classList.remove("ativa");
  tela.classList.add("ativa");
}

function exibirPergunta() {
  podResponder = respostasEscolhidas[numeroPerguntas] === undefined;
  const pergunta = perguntas[numeroPerguntas];
  const respondida = respostasEscolhidas[numeroPerguntas] !== undefined;
  
  elementos.contadorPergunta.textContent = "Pergunta " + (numeroPerguntas + 1) + " de " + perguntas.length;
  elementos.tituloPergunta.textContent = pergunta.titulo;
  elementos.preenchimentoProgresso.style.width = ((respondida ? numeroPerguntas + 1 : numeroPerguntas) / perguntas.length) * 100 + "%";
  atualizarTextoTempo();
  
  elementos.respostasDiv.innerHTML = "";
  
  for (let i = 0; i < pergunta.respostas.length; i++) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-resposta";
    botao.textContent = pergunta.respostas[i];
    botao.disabled = respondida;
    
    if (respondida) {
      if (i === pergunta.correta) botao.classList.add("correta");
      if (i === respostasEscolhidas[numeroPerguntas]) botao.classList.add("errada");
    }
    
    botao.onclick = function() {
      verificarResposta(botao, i);
    };
    
    elementos.respostasDiv.appendChild(botao);
  }
}

function verificarResposta(botao, numeroResposta) {
  if (!podResponder) return;
  
  podResponder = false;
  respostasEscolhidas[numeroPerguntas] = numeroResposta;
  const pergunta = perguntas[numeroPerguntas];
  const estaCorreta = numeroResposta === pergunta.correta;
  
  if (estaCorreta) pontuacao++;
  
  botao.classList.add(estaCorreta ? "correta" : "errada");
  
  const todosBotoes = document.querySelectorAll(".botao-resposta");
  for (let i = 0; i < todosBotoes.length; i++) {
    todosBotoes[i].disabled = true;
    if (i === pergunta.correta) todosBotoes[i].classList.add("correta");
  }
  
  elementos.preenchimentoProgresso.style.width = ((numeroPerguntas + 1) / perguntas.length) * 100 + "%";
  salvarSessao();
  
  timeoutProximaPergunta = setTimeout(proximaPergunta, 850);
}

function proximaPergunta() {
  timeoutProximaPergunta = null;
  
  if (numeroPerguntas === perguntas.length - 1) {
    finalizarQuiz();
    return;
  }
  
  elementos.caixaPergunta.classList.add("saindo");
  
  setTimeout(function() {
    numeroPerguntas++;
    elementos.caixaPergunta.classList.remove("saindo");
    elementos.caixaPergunta.classList.add("entrando");
    exibirPergunta();
    salvarSessao();
    
    setTimeout(function() {
      elementos.caixaPergunta.classList.remove("entrando");
    }, 550);
  }, 450);
}

function finalizarQuiz() {
  pararTimer();
  elementos.textoPontuacao.textContent = pontuacao + "/" + perguntas.length;
  elementos.textoTempoFinal.textContent = "Tempo: " + formatarTempo(tempoDecorrido);
  
  const ranking = obterRanking();
  ranking.push({
    nome: nomeJogador,
    pontuacao: pontuacao,
    total: perguntas.length,
    tempoDecorrido: tempoDecorrido,
    data: new Date().toISOString()
  });
  
  ranking.sort(function(a, b) {
    if (a.pontuacao !== b.pontuacao) return b.pontuacao - a.pontuacao;
    return a.tempoDecorrido - b.tempoDecorrido;
  });
  
  salvarRanking(ranking);
  renderizarRanking();
  localStorage.removeItem("sessao");
  exibirTela(elementos.telaResultado);
}

function iniciarQuiz() {
  if (timeoutProximaPergunta !== null) clearTimeout(timeoutProximaPergunta);
  timeoutProximaPergunta = null;
  
  numeroPerguntas = 0;
  pontuacao = 0;
  respostasEscolhidas = [];
  tempoDecorrido = 0;
  
  elementos.nomeJogadorAtual.textContent = nomeJogador;
  exibirTela(elementos.telaQuiz);
  iniciarTimer();
  exibirPergunta();
  salvarSessao();
}

function restaurarSessao(dadosSessao) {
  nomeJogador = dadosSessao.nomeJogador.trim();
  numeroPerguntas = Math.min(Math.max(dadosSessao.numeroPerguntas, 0), perguntas.length - 1);
  respostasEscolhidas = dadosSessao.respostasEscolhidas.slice(0, perguntas.length);
  pontuacao = dadosSessao.pontuacao;
  tempoDecorrido = dadosSessao.tempoDecorrido;
  
  elementos.nomeJogadorAtual.textContent = nomeJogador;
  exibirTela(elementos.telaQuiz);
  iniciarTimer();
  exibirPergunta();
  
  if (respostasEscolhidas[numeroPerguntas] !== undefined) {
    timeoutProximaPergunta = setTimeout(proximaPergunta, 850);
  }
}

// Listeners de eventos
elementos.formLogin.onsubmit = function(e) {
  e.preventDefault();
  const nome = elementos.nomeJogadorInput.value.trim();
  if (!nome) {
    elementos.nomeJogadorInput.focus();
    return;
  }
  nomeJogador = nome;
  elementos.nomeJogadorAtual.textContent = nomeJogador;
  exibirTela(elementos.telaInicio);
};

elementos.botaoIniciar.onclick = iniciarQuiz;

elementos.botaoReiniciar.onclick = function() {
  localStorage.removeItem("sessao");
  exibirTela(elementos.telaLogin);
  elementos.nomeJogadorInput.value = "";
  elementos.nomeJogadorInput.focus();
};

window.addEventListener("beforeunload", salvarSessao);

// Inicialização
const sessaoSalva = carregarSessao();
if (sessaoSalva) {
  restaurarSessao(sessaoSalva);
} else {
  exibirTela(elementos.telaLogin);
}