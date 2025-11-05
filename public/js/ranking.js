import { $ } from './utils.js';

const RANKING_KEY = 'ewh_ranking_v1';
const MAX_ENTRIES = 10; 

function loadRanking() {
  const raw = localStorage.getItem(RANKING_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveRanking(ranking) {
  localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
}

export function updateRanking(player) {    
  if (!player.name || player.score <= 0) return; 

  const ranking = loadRanking();
  const playerIndex = ranking.findIndex(p => p.name === player.name);

  if (playerIndex > -1) {
    if (player.score > ranking[playerIndex].score) {
      ranking[playerIndex].score = player.score;
      ranking[playerIndex].avatar = player.avatar;
    }
  } else {
    ranking.push({ name: player.name, score: player.score, avatar: player.avatar });
  }

  // Ordena por maior pontuação e limita o número de entradas
  ranking.sort((a, b) => b.score - a.score);
  const topRanking = ranking.slice(0, MAX_ENTRIES);

  saveRanking(topRanking);
}

export function renderRanking() {
  const ranking = loadRanking();
  const listEl = $('rankingList');

  if (!listEl) return;

  listEl.innerHTML = ''; 

  if (ranking.length === 0) {
    listEl.innerHTML = '<li>Nenhuma pontuação registrada ainda.</li>';
    return;
  }

  ranking.forEach((player, index) => {
    const li = document.createElement('li');
    const avatarImg = `<img src="assets/avatars/${player.avatar}.png" class="ranking-avatar" alt="Avatar">`;
    li.innerHTML = `
      ${avatarImg}
      <span class="ranking-position">${index + 1}º</span> 
      <strong>${player.name}</strong> 
      <span>- ${player.score} pontos</span>
    `;
    listEl.appendChild(li);
  });
}

export function clearRanking() {
    localStorage.removeItem(RANKING_KEY);
}