import { updateRanking } from './ranking.js';

const STORAGE_KEY = 'ewh_player_v1';
export const LIVES_DEFAULT = 3;

export function loadPlayer() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  const player = {
    name: null,
    avatar: null,
    lives: LIVES_DEFAULT,
    score: 0,
    unlocked: [1],
    currentLevel: 1
  };
  savePlayer(player);
  return player;
}

export function savePlayer(player) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

export function resetForNewGame(player) {
  player.lives = LIVES_DEFAULT;
  player.score = 0;
  player.currentLevel = 1;
  player.unlocked = [1];
  //savePlayer(player);
}
