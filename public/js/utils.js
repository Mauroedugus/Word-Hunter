// utils.js
export const $ = id => document.getElementById(id);
export const qsa = sel => Array.from(document.querySelectorAll(sel));

export function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let currentBgLayer = 1;
let currentBgImage = 'default';

export function changeBackground(imageName = 'default') {
  if (imageName === currentBgImage) return;

  const layer1 = $('bg-layer-1');
  const layer2 = $('bg-layer-2');

  // Identifica qual camada está ativa (saindo) e qual está inativa (entrando)
  const activeLayer = currentBgLayer === 1 ? layer1 : layer2;
  const nextLayer = currentBgLayer === 1 ? layer2 : layer1;
  
  const gradient = 'linear-gradient(rgba(0, 0, 0, 0.20), rgba(0, 0, 0, 0.25))';
  const defaultBgUrl = '/assets/images/backgrounds/background.png';
  const imageUrl = imageName === 'default' 
    ? defaultBgUrl 
    : `/assets/images/backgrounds/${imageName}`;

  const preloader = new Image();
  preloader.src = imageUrl;

  preloader.onload = () => {
    nextLayer.style.backgroundImage = `${gradient}, url("${imageUrl}")`;

    activeLayer.classList.add('fade-out');

    activeLayer.addEventListener('animationend', () => {
      activeLayer.classList.remove('fade-out');
      activeLayer.classList.add('hidden');
      
      nextLayer.classList.remove('hidden');
      nextLayer.classList.add('fade-in');

      setTimeout(() => nextLayer.classList.remove('fade-in'), 500); 

    }, { once: true });

    currentBgLayer = currentBgLayer === 1 ? 2 : 1;
    currentBgImage = imageName;
  };
}