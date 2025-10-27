// avatarSelection.js
import { $, qsa } from './utils.js';
import { savePlayer } from './player.js';

export function setupAvatarCarousel(player, onChange) {
    const avatars = qsa('.avatar');
    if (!avatars.length) return;
  
    let current = avatars.findIndex(a => a.dataset.key === player.avatar);
    if (current === -1) current = 0;
  
    function updateSelection() {
      avatars.forEach((a, i) => a.classList.toggle('selected', i === current));
      player.avatar = avatars[current].dataset.key;
      if (onChange) onChange(); // atualiza o botão
    }
  
    const btnPrev = $('btnAvatarPrev');
    const btnNext = $('btnAvatarNext');
  
    if (btnPrev) btnPrev.addEventListener('click', () => {
      current = (current - 1 + avatars.length) % avatars.length;
      updateSelection();
    });
  
    if (btnNext) btnNext.addEventListener('click', () => {
      current = (current + 1) % avatars.length;
      updateSelection();
    });
  
    avatars.forEach((a, i) => {
      a.addEventListener('click', () => {
        current = i;
        updateSelection();
      });
    });
  
    updateSelection();
  }
  
