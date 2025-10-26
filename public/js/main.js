// main.js
import { loadPlayer, savePlayer, resetForNewGame } from './player.js';
import { showScreen, SCREENS } from './screens.js';
import { renderMap } from './map.js';
import { loadData, nextLevelByResult } from './game.js';
import { $, qsa } from './utils.js';
import { setupAvatarCarousel } from './avatarSelection.js';

document.addEventListener('DOMContentLoaded', async () => {
    const player = loadPlayer();
    await loadData();

    function validateChar() {
        const btn = $('btnCharContinue');
        btn.classList.toggle('disabled', !(player.name && player.avatar));
    }

    // Inicializa o input com o valor do player
    const nameInput = $('playerName');
    nameInput.value = player.name || '';
    nameInput.addEventListener('input', e => {
        player.name = e.target.value.trim();
        savePlayer(player);
        validateChar();
    });

    setupAvatarCarousel(player, validateChar); // atualiza botão quando avatar muda

    validateChar(); // valida estado inicial do botão

    renderMap(player);
    showScreen(SCREENS.TITLE);

    //Tela inicial
    $('btnStart').addEventListener('click', () => showScreen(SCREENS.CHAR));
    $('btnHow').addEventListener('click', () => showScreen(SCREENS.HOW));
    
    //Tela Como jogar
    $('btnBackFromHow').addEventListener('click', () => showScreen(SCREENS.TITLE));

    //Tela seleção de personagens
    $('btnCharContinue').addEventListener('click', () => {
        if (!player.name || !player.avatar) return;
        renderMap(player);
        showScreen(SCREENS.MAP);
    });

    $('btnCharBack').addEventListener('click', () => showScreen(SCREENS.TITLE));

    //Tela Mapa
    $('btnMapBack').addEventListener('click', () => showScreen(SCREENS.CHAR));
    $('btnOpenRanking').addEventListener('click', () => showScreen(SCREENS.RANKING));

    //Tela jogo
    $('btnQuitToMap').addEventListener('click', () => {
        if(confirm('Voltar ao mapa? Progresso atual da fase será perdido.')){
            renderMap(player);
            showScreen(SCREENS.MAP);
        }
    });

    //Tela Ranking
    $('btnRankingBack').addEventListener('click', () => showScreen(SCREENS.MAP));
    $('btnClearRanking').addEventListener('click', () => alert("Essa funcionalidade ainda não foi feita"));

    //Tela Result
    $('btnResultToMap').addEventListener('click', () => {
        renderMap(player);
        showScreen(SCREENS.MAP);
    });
    
    $('btnNextPhase').addEventListener('click', () => nextLevelByResult(player));
});
