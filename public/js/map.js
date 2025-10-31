// map.js
import { $, qsa } from './utils.js';
import { savePlayer } from './player.js';
import { showScreen, SCREENS } from './screens.js';
import { startLevel } from './game.js';

const tooltip = document.getElementById('mapTooltip');

export const MAP_LEVELS = [
  { level: 1, name: 'Ilha das Cores', xPct: 35, yPct: 75, theme: 'colors',  background: 'bg_colors.png' },
  { level: 2, name: 'Ilha dos Animais', xPct: 67, yPct: 65, theme: 'animals',  background: 'bg_animals.png' },
  { level: 3, name: 'Ilha dos Números', xPct: 75, yPct: 25, theme: 'numbers',  background: 'bg_numbers.png' },
  { level: 4, name: 'Ilha da Comida', xPct: 25, yPct: 30, theme: 'foods',  background: 'bg_foods.png' }
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
    div.style.position = 'absolute';

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

    // --- Tooltip customizado ---
    div.addEventListener('mouseenter', () => {
      tooltip.textContent = unlocked ? lv.name : `${lv.name}`;
      tooltip.classList.add('visible');
    });

    div.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${e.pageX}px`;
      tooltip.style.top = `${e.pageY - 20}px`;
    });

    div.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });

    // --- Clique para iniciar ---
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
