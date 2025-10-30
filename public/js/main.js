// main.js
import { preloadImages } from './preloader.js';
import { loadPlayer, savePlayer, resetForNewGame } from './player.js';
import { showScreen, SCREENS } from './screens.js';
import { renderMap, MAP_LEVELS } from './map.js';
import { loadData, nextLevelByResult, getGameState, startLevel, clearTimer } from './game.js';
import { $, qsa, changeBackground } from './utils.js';
import { setupAvatarCarousel } from './avatarSelection.js';
import { renderRanking, clearRanking, updateRanking } from './ranking.js';

document.addEventListener('DOMContentLoaded', async () => {
    const backgroundUrls = MAP_LEVELS.map(level => `/assets/images/backgrounds/${level.background}`);
    backgroundUrls.push('/assets/images/backgrounds/background.png');

    try {
        await preloadImages(backgroundUrls);
        console.log('Todos os backgrounds foram pré-carregados com sucesso!');
    } catch (error) {
        console.error('Erro durante o pré-carregamento de imagens:', error);
    }

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

        const savedPlayerState = loadPlayer();
        if(player.name !== savedPlayerState.name){
            resetForNewGame(player);
        }
        savePlayer(player);
        updateRanking(player);
        renderMap(player);
        showScreen(SCREENS.MAP);
    });

    $('btnCharBack').addEventListener('click', () => showScreen(SCREENS.TITLE));

    //Tela Mapa
    $('btnMapBack').addEventListener('click', () => showScreen(SCREENS.CHAR));
    $('btnOpenRanking').addEventListener('click', () => {
        updateRanking(player);
        renderRanking();
        showScreen(SCREENS.RANKING);
    });

    //Tela jogo
    $('btnQuitToMap').addEventListener('click', () => {
        if(confirm('Voltar ao mapa? Progresso atual da fase será perdido.')){
            clearTimer();
            const initialGameState = getGameState();
            
            player.score = initialGameState.initialScore;
            player.lives = initialGameState.initialLives;
            
            savePlayer(player);
            renderMap(player);
            changeBackground('default');
            showScreen(SCREENS.MAP);
        }
    });

    //Tela Ranking
    $('btnRankingBack').addEventListener('click', () => showScreen(SCREENS.MAP));
    $('btnClearRanking').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja apagar todo o ranking? Esta ação não pode ser desfeita.')){
            clearRanking();
            renderRanking();
        }
    });

    //Tela Fim de Jogo 
    $('btnRetryLevel').addEventListener('click', () => {
        const lastState = getGameState();
        const levelData = MAP_LEVELS.find(lv => lv.level === lastState.level);
        if (levelData) { startLevel(levelData.level, levelData.theme, player); }
    });

    $('btnGameOverToTitle').addEventListener('click', () => {
        changeBackground('default');
        showScreen(SCREENS.TITLE);  
    });

    //Tela Result
    $('btnResultToMap').addEventListener('click', () => {
        renderMap(player);
        changeBackground('default');
        showScreen(SCREENS.MAP);
    });
    
    $('btnNextPhase').addEventListener('click', () => nextLevelByResult(player));
});
