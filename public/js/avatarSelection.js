import { $, qsa } from './utils.js';

export async function setupAvatarCarousel(player, onChange) {
  const btnPrev = $('btnAvatarPrev');
  const btnNext = $('btnAvatarNext');
  const avatarKeys = await fetch('/data/avatars.json').then(res => res.json());

  avatarKeys.forEach(key => {
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.dataset.key = key;

    const img = document.createElement('img');
    img.src = `/assets/avatars/${key}.png`;
    img.alt = key;
    
    avatarDiv.appendChild(img);

    btnNext.before(avatarDiv);
  });
  
  const avatars = qsa('.avatar');
  if (!avatars.length) return;

  let current = avatars.findIndex(a => a.dataset.key === player.avatar);
  if (current === -1) current = 0;

  function updateSelection() {
    avatars.forEach((a, i) => a.classList.toggle('selected', i === current));
    player.avatar = avatars[current].dataset.key;
    if (onChange) onChange(); 
  }

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
  
