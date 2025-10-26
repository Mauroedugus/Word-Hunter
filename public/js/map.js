// map.js
import { $, qsa } from './utils.js';
import { savePlayer } from './player.js';
import { showScreen, SCREENS } from './screens.js';
import { startLevel } from './game.js';

export const MAP_LEVELS = [
  { level: 1, name: 'Fase 1: Floresta', xPct: 40, yPct: 75, theme: 'animals' },
  { level: 2, name: 'Fase 2: Deserto', xPct: 78, yPct: 28, theme: 'colors' },
  { level: 3, name: 'Fase 3: Vulcão', xPct: 20, yPct: 25, theme: 'animals' },
  { level: 4, name: 'Fase 4: Nuvens', xPct: 85, yPct: 82, theme: 'colors' }
];

export function renderMap(player) {
  $('playerAvatarSmall').src = player.avatar ? `assets/avatars/${player.avatar}.jpg` : '';
  $('playerNameLabel').textContent = player.name ? `${player.name} (Nível ${player.currentLevel})` : '';
  $('hudScore').textContent = player.score;
  $('hudLives').textContent = player.lives;

  const container = $('mapArea');
  container.innerHTML = '';
  MAP_LEVELS.forEach(lv => {
    const div = document.createElement('div');
    div.className = 'mapNode';
    div.style.left = `calc(${lv.xPct}% - 42px)`;
    div.style.top = `calc(${lv.yPct}% - 42px)`;
    const unlocked = player.unlocked.includes(lv.level);
    div.classList.add(unlocked ? 'unlocked' : 'locked');
    div.innerHTML = `<div>${lv.level}</div>`;
    div.title = lv.name + (unlocked ? '' : ' (Bloqueado)');
    div.addEventListener('click', () => {
      if (!unlocked) {
        alert('Fase bloqueada. Jogue e consiga pontos para desbloquear!');
        return;
      }
      startLevel(lv.level, lv.theme, player);
    });
    container.appendChild(div);
  });
}
