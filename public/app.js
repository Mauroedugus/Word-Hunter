/* document.addEventListener('DOMContentLoaded', () => {
    // SCREENS
    const SCREENS = {
        TITLE: 'titleScreen',
        CHAR: 'charScreen',
        MAP: 'mapScreen',
        GAME: 'gameScreen',
        RESULT: 'resultScreen'
    };

    const QUESTIONS_PER_PHASE = 5;
    const BASE_POINTS = 100;
    const COMBO_BONUS = 50;
    const LIVES_DEFAULT = 3;

    const MAP_LEVELS = [
        { level: 1, name: 'Fase 1: Floresta', xPct: 40, yPct: 75, theme: 'animals' },
        { level: 2, name: 'Fase 2: Deserto', xPct: 78, yPct: 28, theme: 'colors' },
        { level: 3, name: 'Fase 3: Vulcão', xPct: 20, yPct: 25, theme: 'animals' },
        { level: 4, name: 'Fase 4: Nuvens', xPct: 85, yPct: 82, theme: 'colors' }
    ];

    const STORAGE_KEY = 'ewh_player_v1';
    let imageToWords = null, wordToImages = null, player = null, gameState = null;
    let questionTimer = null;

    // helpers
    const $ = id => document.getElementById(id);
    const qsa = sel => Array.from(document.querySelectorAll(sel));

    function showScreen(screenId){
        qsa('.screen').forEach(s => s.classList.add('hidden'));
        $(screenId).classList.remove('hidden');
    }

    async function loadData(){
        const [r1, r2] = await Promise.all([
            fetch('data/image_to_words.json').then(r => r.json()),
            fetch('data/word_to_images.json').then(r => r.json())
        ]);
        imageToWords = r1;
        wordToImages = r2;
    }

    function loadPlayer(){
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw){
            try { player = JSON.parse(raw); return; } catch(e){}
        }
        player = {
            name: null,
            avatar: null,
            lives: LIVES_DEFAULT,
            score: 0,
            unlocked: [1],
            currentLevel: 1
        };
        savePlayer();
    }

    function savePlayer(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(player)); }

    function resetForNewGame(){
        player.lives = LIVES_DEFAULT;
        player.score = 0;
        player.currentLevel = 1;
        savePlayer();
    }

    function renderChar(){
        // mostra avatar selecionado
        qsa('.avatar').forEach(a => {
            a.classList.toggle('selected', a.dataset.key === player.avatar);
        });
        $('playerName').value = player.name || '';
        validateChar();
    }

    function validateChar(){
        const btn = $('btnCharContinue');
        btn.classList.toggle('disabled', !(player.name && player.avatar));
    }

    function wireUI(){
        // Title screen
        $('btnStart').addEventListener('click', () => {
            player.name = null;
            player.avatar = null;
            savePlayer();
            renderChar();
            showScreen(SCREENS.CHAR);
        });

        $('btnHow').addEventListener('click', () => {
            loadPlayer();
            renderMap();
            showScreen(SCREENS.MAP);
        });

        // Character selection
        qsa('.avatar').forEach(el => {
            el.addEventListener('click', () => {
                qsa('.avatar').forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
                player.avatar = el.dataset.key;
                savePlayer();
                validateChar();
            });
        });

        $('playerName').addEventListener('input', e => {
            player.name = e.target.value.trim();
            savePlayer();
            validateChar();
        });

        $('btnCharBack').addEventListener('click', () => showScreen(SCREENS.TITLE));

        $('btnCharContinue').addEventListener('click', () => {
            if(!player.name || !player.avatar) return;
            player.lives = LIVES_DEFAULT;
            player.score = 0;
            player.currentLevel = 1;
            if(!player.unlocked || player.unlocked.length === 0) player.unlocked = [1];
            savePlayer();
            renderMap();
            showScreen(SCREENS.MAP);
        });

        // Map screen
        $('btnMapBack').addEventListener('click', () => showScreen(SCREENS.TITLE));

        $('btnQuitToMap').addEventListener('click', () => {
            if(confirm('Voltar ao mapa? Progresso atual da fase será perdido.')){
                renderMap();
                showScreen(SCREENS.MAP);
            }
        });

        // Result
        $('btnResultToMap').addEventListener('click', () => {
            renderMap();
            showScreen(SCREENS.MAP);
        });

        $('btnNextPhase').addEventListener('click', () => {
            const nextLevel = gameState.level + 1;
            if(!player.unlocked.includes(nextLevel)) player.unlocked.push(nextLevel);
            player.currentLevel = Math.min(nextLevel, MAP_LEVELS.length);
            savePlayer();
            renderMap();
            showScreen(SCREENS.MAP);
        });
    }

    function renderMap(){
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
                if(!unlocked){
                    alert('Fase bloqueada. Jogue e consiga pontos para desbloquear!');
                    return;
                }
                startLevel(lv.level, lv.theme);
            });
            container.appendChild(div);
        });
    }

    function startLevel(levelNumber, theme){
        gameState = {
            level: levelNumber,
            theme,
            questionCount: 0,
            consecutiveCorrect: 0,
            lives: player.lives,
            score: player.score,
            requiredToUnlock: requiredPointsForLevel(levelNumber)
        };
        runNextQuestion();
        showScreen(SCREENS.GAME);
        renderGameHUD();
    }

    function requiredPointsForLevel(level){
        return 400 * level;
    }

    function renderGameHUD(){
        $('gameScore').textContent = gameState.score;
        $('gameLives').textContent = gameState.lives;
    }

    function pickRandomQuestion(theme){
        const modeIsImage = Math.random() < 0.5;
        if(modeIsImage){
            const arr = (imageToWords.phases[theme] || []);
            const q = arr[Math.floor(Math.random()*arr.length)];
            if(!q) return null;
            return { mode:'image', question:q.image, correct:q.correct, options:shuffleArray(q.options.slice()) };
        } else {
            const arr = (wordToImages.phases[theme] || []);
            const q = arr[Math.floor(Math.random()*arr.length)];
            if(!q) return null;
            return { mode:'word', question:q.word, correct:q.correct, options:shuffleArray(q.options.slice()) };
        }
    }

    function runNextQuestion(){
        gameState.questionCount++;
        if(gameState.questionCount > QUESTIONS_PER_PHASE){
            endPhase();
            return;
        }

        const timePerQuestion = Math.max(6, 18 - (gameState.level-1)*3);
        const q = pickRandomQuestion(gameState.theme);
        if(!q){
            alert('Sem dados para essa fase/tema');
            showScreen(SCREENS.MAP);
            return;
        }

        renderQuestion(q);
        startTimer(timePerQuestion, () => handleAnswer('TIMEOUT_NO_ANSWER', q.correct, null, q));
        renderGameHUD();
    }

    function renderQuestion(q){
        const qa = $('questionArea');
        const oa = $('optionsArea');
        qa.innerHTML = '';
        oa.innerHTML = '';

        if(q.mode === 'image'){
            const img = document.createElement('img');
            img.src = q.question;
            img.alt = 'question image';
            img.style.maxWidth = '320px';
            qa.appendChild(img);

            q.options.forEach(opt => {
                const c = document.createElement('div');
                c.className = 'optionCard';
                c.textContent = opt.toUpperCase();
                c.addEventListener('click', () => handleAnswer(opt, q.correct, c, q));
                oa.appendChild(c);
            });
        } else {
            const t = document.createElement('div');
            t.style.fontSize = '48px';
            t.textContent = q.question.toUpperCase();
            qa.appendChild(t);

            q.options.forEach(opt => {
                const c = document.createElement('div');
                c.className = 'optionCard';
                const img = document.createElement('img');
                img.src = opt;
                c.appendChild(img);
                c.addEventListener('click', () => handleAnswer(opt, q.correct, c, q));
                oa.appendChild(c);
            });
        }
    }

    function startTimer(seconds, onTimeout){
        clearTimer();
        let left = seconds;
        $('gameTimer').textContent = left;
        questionTimer = setInterval(() => {
            left--;
            $('gameTimer').textContent = left;
            if(left <= 0){
                clearTimer();
                onTimeout && onTimeout();
            }
        }, 1000);
    }

    function clearTimer(){ if(questionTimer){ clearInterval(questionTimer); questionTimer=null; } }

    function handleAnswer(selected, correct, buttonEl, qObj){
        clearTimer();
        qsa('.optionCard').forEach(c => c.style.pointerEvents='none');

        const isCorrect = selected === correct;
        if(isCorrect){
            gameState.consecutiveCorrect++;
            const gained = BASE_POINTS + COMBO_BONUS * Math.max(0, gameState.consecutiveCorrect-1);
            gameState.score += gained;
            player.score = gameState.score;
            if(buttonEl) buttonEl.classList.add('correct');
            showFeedback(`Certo! +${gained} pts`, true);
        } else {
            gameState.consecutiveCorrect=0;
            gameState.lives--;
            player.lives=gameState.lives;
            if(buttonEl) buttonEl.classList.add('wrong');
            showFeedback(selected==='TIMEOUT_NO_ANSWER' ? 'Tempo esgotado! -1 vida':'Errado! -1 vida', false);
        }

        savePlayer();
        renderGameHUD();

        if(gameState.lives<=0){
            setTimeout(()=>{
                alert('Você perdeu todas as vidas!');
                player.lives=LIVES_DEFAULT;
                savePlayer();
                renderMap();
                showScreen(SCREENS.MAP);
            },900);
            return;
        }

        setTimeout(()=>{
            if(gameState.questionCount>=QUESTIONS_PER_PHASE) endPhase();
            else runNextQuestion();
        },1100);
    }

    function showFeedback(text, positive){
        const qa = $('questionArea');
        const f = document.createElement('div');
        f.style.position='absolute';
        f.style.background = positive ? '#005f2f':'#5f0000';
        f.style.padding='12px 18px';
        f.style.borderRadius='12px';
        f.style.color='#fff';
        f.style.fontWeight='700';
        f.textContent=text;
        qa.appendChild(f);
        setTimeout(()=>{ if(f.parentNode) f.parentNode.removeChild(f); },900);
    }

    function endPhase(){
        clearTimer();
        const required = gameState.requiredToUnlock;
        const ok = gameState.score >= required;
        const nextLv = gameState.level+1;

        if(ok && !player.unlocked.includes(nextLv)) player.unlocked.push(nextLv);
        player.currentLevel = gameState.level;
        player.score = gameState.score;
        player.lives = gameState.lives;
        savePlayer();

        // result summary
        $('resultSummary').innerHTML = `
            <h2>${ok ? 'Fase Concluída!' : 'Fase Finalizada'}</h2>
            <p><strong>Pontos: ${gameState.score}</strong></p>
            <p>Você precisava de <strong>${required}</strong> pontos para desbloquear a próxima fase.</p>
            <p>${ok ? 'Pronto para seguir para a próxima fase!' : 'Pontuação insuficiente para desbloquear a próxima fase.'}</p>
        `;

        $('btnNextPhase').style.display = (nextLv>MAP_LEVELS.length || !ok) ? 'none':'inline-block';
        showScreen(SCREENS.RESULT);
    }

    function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

    (async function boot(){
        await loadData();
        loadPlayer();
        wireUI();
        renderChar();
        showScreen(SCREENS.TITLE);
    })();
});
 */