import { $, qsa } from './utils.js';

export const SCREENS = {
  TITLE: 'titleScreen',
  HOW: 'howScreen',
  CHAR: 'charScreen',
  MAP: 'mapScreen',
  GAME: 'gameScreen',
  RESULT: 'resultScreen',
  RANKING: 'rankingScreen',
  GAME_OVER: 'gameOverScreen'
};

export function showScreen(screenId, fade = true) {
  const current = document.querySelector('.screen:not(.hidden)');
  const next = document.getElementById(screenId.replace('#', ''));

  if (!next) return console.warn('Tela não encontrada:', screenId);

  if (!fade || !current) {
    qsa('.screen').forEach(s => s.classList.add('hidden'));
    next.classList.remove('hidden');
    return;
  }

  // fade-out da tela atual
  current.classList.add('fade-out');

  current.addEventListener(
    'animationend',
    () => {
      current.classList.add('hidden');
      current.classList.remove('fade-out');
      qsa('.screen').forEach(s => s.classList.add('hidden'));
      next.classList.remove('hidden');
      next.classList.add('fade-in');
      setTimeout(() => next.classList.remove('fade-in'), 500);
    },
    { once: true }
  );
}
