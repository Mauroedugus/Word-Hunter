// screens.js
import { $, qsa } from './utils.js';

export const SCREENS = {
  TITLE: 'titleScreen',
  HOW: 'howScreen',
  CHAR: 'charScreen',
  MAP: 'mapScreen',
  GAME: 'gameScreen',
  RESULT: 'resultScreen',
  RANKING: 'rankingScreen'
};

export function showScreen(screenId) {
  qsa('.screen').forEach(s => s.classList.add('hidden'));
  $(screenId).classList.remove('hidden');
}
