// map.js
import { $, qsa } from './utils.js';
import { savePlayer } from './player.js';
import { showScreen, SCREENS } from './screens.js';
import { startLevel } from './game.js';

export const MAP_LEVELS = [
  { level: 1, name: 'Floresta', xPct: 25, yPct: 75, theme: 'animals' },
  { level: 2, name: 'Gelo',  xPct: 75, yPct: 75, theme: 'colors' },
  { level: 3, name: 'Deserto', xPct: 75, yPct: 25, theme: 'animals' },
  { level: 4, name: 'Sorvete', xPct: 25, yPct: 25, theme: 'colors' }
];

export function renderMap(player) {
  $('playerAvatarSmall').src = player.avatar ? `assets/avatars/${player.avatar}.png` : '';
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
    div.style.position = 'absolute'; // garante posicionamento no mapa

    const unlocked = player.unlocked.includes(lv.level);
    div.classList.add(unlocked ? 'unlocked' : 'locked');

    // ilha sempre visível
    const island = document.createElement('img');
    island.className = 'islands';
    island.src = `/assets/images/map/${lv.name}.png`;
    island.alt = lv.name;

    div.appendChild(island);

    // cadeado só se bloqueado
    if (!unlocked) {
      const padlock = document.createElement('img');
      padlock.className = 'padlock';
      padlock.src = '/assets/images/map/padlock.png';
      padlock.alt = `${lv.name} padlock`;
      div.appendChild(padlock);
    }

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
