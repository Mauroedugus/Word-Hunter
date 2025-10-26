// game.js
import { $, qsa, shuffleArray } from './utils.js';
import { savePlayer } from './player.js';
import { showScreen, SCREENS } from './screens.js';
import { MAP_LEVELS, renderMap } from './map.js';

const QUESTIONS_PER_PHASE = 5;
const BASE_POINTS = 100;
const COMBO_BONUS = 50;
const LIVES_DEFAULT = 3;

let imageToWords, wordToImages, gameState, questionTimer;

export async function loadData() {
  const [r1, r2] = await Promise.all([
    fetch('data/image_to_words.json').then(r => r.json()),
    fetch('data/word_to_images.json').then(r => r.json())
  ]);
  imageToWords = r1;
  wordToImages = r2;
}

export function startLevel(levelNumber, theme, player) {
  gameState = {
    level: levelNumber,
    theme,
    questionCount: 0,
    consecutiveCorrect: 0,
    lives: LIVES_DEFAULT,
    score: player.score,
    requiredToUnlock: 400 * levelNumber
  };
  runNextQuestion(player);
  showScreen(SCREENS.GAME);
  renderHUD();
}

function renderHUD() {
  $('gameLevel').textContent = gameState.level;
  $('gameScore').textContent = gameState.score;
  $('gameLives').textContent = gameState.lives;
}

function pickRandomQuestion(theme) {
  const modeIsImage = Math.random() < 0.5;
  if (modeIsImage) {
    const arr = imageToWords.phases[theme] || [];
    const q = arr[Math.floor(Math.random() * arr.length)];
    $('instructionArea').innerHTML = `<h2>Selecione a palavra que corresponde à imagem</h2>`;
    return q ? { mode: 'image', question: q.image, correct: q.correct, options: shuffleArray(q.options.slice()) } : null;
  } else {
    const arr = wordToImages.phases[theme] || [];
    const q = arr[Math.floor(Math.random() * arr.length)];
    $('instructionArea').innerHTML = `<h2>Selecione a imagem que corresponde à palavra</h2>`;
    return q ? { mode: 'word', question: q.word, correct: q.correct, options: shuffleArray(q.options.slice()) } : null;
  }
}

function runNextQuestion(player) {
  if (gameState.questionCount >= QUESTIONS_PER_PHASE) return endPhase(player);
  const q = pickRandomQuestion(gameState.theme);
  if (!q) return showScreen(SCREENS.MAP);
  renderQuestion(q, player);
  startTimer(10, () => handleAnswer('TIMEOUT', q.correct, null, q, player));

  gameState.questionCount++;
}

function renderQuestion(q, player) {
  const qa = $('questionArea');
  const oa = $('optionsArea');
  qa.innerHTML = '';
  oa.innerHTML = '';

  if (q.mode === 'image') {
    const img = document.createElement('img');
    img.src = q.question;
    qa.appendChild(img);
    q.options.forEach(opt => {
      const c = document.createElement('div');
      c.className = 'optionCard';
      c.textContent = opt.toUpperCase();
      c.addEventListener('click', () => handleAnswer(opt, q.correct, c, q, player));
      oa.appendChild(c);
    });
  } else {
    const t = document.createElement('div');
    t.textContent = q.question.toUpperCase();
    qa.appendChild(t);
    q.options.forEach(opt => {
      const c = document.createElement('div');
      c.className = 'optionCard';
      const img = document.createElement('img');
      img.src = opt;
      c.appendChild(img);
      c.addEventListener('click', () => handleAnswer(opt, q.correct, c, q, player));
      oa.appendChild(c);
    });
  }
}

function startTimer(seconds, onTimeout) {
  clearTimer();
  let left = seconds;
  $('gameTimer').textContent = left;
  questionTimer = setInterval(() => {
    left--;
    $('gameTimer').textContent = left;
    if (left <= 0) { clearTimer(); onTimeout && onTimeout(); }
  }, 1000);
}

function clearTimer() {
  if (questionTimer) clearInterval(questionTimer);
  questionTimer = null;
}

function handleAnswer(selected, correct, buttonEl, q, player) {
  clearTimer();
  qsa('.optionCard').forEach(c => c.style.pointerEvents = 'none');
  const isCorrect = selected === correct;

  if (isCorrect) {
    gameState.consecutiveCorrect++;
    const gained = BASE_POINTS + COMBO_BONUS * Math.max(0, gameState.consecutiveCorrect - 1);
    gameState.score += gained;
    player.score = gameState.score;
    if (buttonEl) buttonEl.classList.add('correct');
  } else {
    gameState.lives--;
    player.lives = gameState.lives;
    if (buttonEl) buttonEl.classList.add('wrong');
  }
  savePlayer(player);
  renderHUD();

  if (gameState.lives <= 0) return showScreen(SCREENS.MAP);
  setTimeout(() => runNextQuestion(player), 1000);
}

function endPhase(player) {
  clearTimer();
  const required = gameState.requiredToUnlock;
  const ok = gameState.score >= required;
  const nextLv = gameState.level+1;

  if(ok && !player.unlocked.includes(nextLv)) player.unlocked.push(nextLv);
  player.currentLevel = gameState.level;
  player.score = gameState.score;
  player.lives = gameState.lives;
  savePlayer(player);

  // result summary
  $('resultSummary').innerHTML = `
  <h2>${ok ? 'Fase Concluída!' : 'Fase Finalizada'}</h2>
  <p><strong>Pontos: ${gameState.score}</strong></p>
  <p>Você precisava de <strong>${required}</strong> pontos para desbloquear a próxima fase.</p>
  <p>${ok ? 'Pronto para seguir para a próxima fase!' : 'Pontuação insuficiente para desbloquear a próxima fase.'}</p>
  `;

  $('btnNextPhase').style.display = (nextLv>MAP_LEVELS.length || !ok) ? 'none':'inline-block';
  showScreen(SCREENS.RESULT);
}

export function nextLevelByResult(player) {
  const nextLevel = gameState.level + 1;
  if(player.unlocked.includes(nextLevel)) {
    savePlayer(player);
    const nextIndex = MAP_LEVELS.findIndex(lv => lv.level === nextLevel);
    if (nextIndex !== -1) {
      startLevel(MAP_LEVELS[nextIndex].level, MAP_LEVELS[nextIndex].theme, player);
    }
  };

};

