const { createApp, ref, computed } = Vue;

const icons = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭', '🍍', '🥥', '🍌', '🍆', '🥑', '🌽', '🥕', '🍅', '🫐'];

const app = createApp({
    setup() {
        const gameState = ref('start');
        const difficulty = ref('medium');
        const cards = ref([]);
        const flippedCards = ref([]);
        const matchedPairs = ref(0);
        const score = ref(0);
        const timer = ref(0);
        const moves = ref(0);
        const consecutiveMatches = ref(0);
        let timerInterval = null;

        const difficultyConfig = {
            easy: { pairs: 6, baseScore: 10, timeBonus: 50 },
            medium: { pairs: 8, baseScore: 15, timeBonus: 75 },
            hard: { pairs: 12, baseScore: 20, timeBonus: 100 }
        };

        const pairsCount = computed(() => difficultyConfig[difficulty.value].pairs);

        const shuffleArray = (array) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        const createCards = () => {
            const selectedIcons = shuffleArray(icons).slice(0, pairsCount.value);
            const cardPairs = [...selectedIcons, ...selectedIcons];
            const shuffledCards = shuffleArray(cardPairs);
            cards.value = shuffledCards.map((icon, index) => ({
                id: index,
                icon,
                isFlipped: false,
                isMatched: false
            }));
        };

        const startGame = () => {
            gameState.value = 'playing';
            createCards();
            flippedCards.value = [];
            matchedPairs.value = 0;
            score.value = 0;
            timer.value = 0;
            moves.value = 0;
            consecutiveMatches.value = 0;
            startTimer();
        };

        const startTimer = () => {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timer.value++;
            }, 1000);
        };

        const stopTimer = () => {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        };

        const flipCard = (card) => {
            if (gameState.value !== 'playing') return;
            if (card.isFlipped || card.isMatched) return;
            if (flippedCards.value.length >= 2) return;

            card.isFlipped = true;
            flippedCards.value.push(card);
            moves.value++;

            if (flippedCards.value.length === 2) {
                checkMatch();
            }
        };

        const checkMatch = () => {
            const [card1, card2] = flippedCards.value;

            if (card1.icon === card2.icon) {
                setTimeout(() => {
                    card1.isMatched = true;
                    card2.isMatched = true;
                    matchedPairs.value++;
                    consecutiveMatches.value++;
                    
                    const baseScore = difficultyConfig[difficulty.value].baseScore;
                    const comboBonus = Math.min(consecutiveMatches.value - 1, 5) * 5;
                    score.value += baseScore + comboBonus;
                    
                    flippedCards.value = [];

                    if (matchedPairs.value === pairsCount.value) {
                        winGame();
                    }
                }, 500);
            } else {
                consecutiveMatches.value = 0;
                setTimeout(() => {
                    card1.isFlipped = false;
                    card2.isFlipped = false;
                    flippedCards.value = [];
                }, 1000);
            }
        };

        const calculateStars = () => {
            const config = difficultyConfig[difficulty.value];
            const optimalMoves = config.pairs * 2;
            const movesRatio = optimalMoves / moves.value;
            
            if (timer.value <= 30 && movesRatio >= 0.8) return 5;
            if (timer.value <= 60 && movesRatio >= 0.6) return 4;
            if (timer.value <= 90 && movesRatio >= 0.4) return 3;
            if (timer.value <= 120) return 2;
            return 1;
        };

        const winGame = () => {
            stopTimer();
            
            const config = difficultyConfig[difficulty.value];
            const timeBonus = Math.max(0, config.timeBonus - timer.value);
            const movesBonus = Math.max(0, config.pairs * 20 - moves.value * 2);
            score.value += Math.max(0, timeBonus) + Math.max(0, movesBonus);
            
            gameState.value = 'win';
        };

        const resetGame = () => {
            stopTimer();
            gameState.value = 'start';
            cards.value = [];
            flippedCards.value = [];
            matchedPairs.value = 0;
            score.value = 0;
            timer.value = 0;
            moves.value = 0;
            consecutiveMatches.value = 0;
        };

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        const getStarsDisplay = (count) => {
            return '⭐'.repeat(count) + '☆'.repeat(5 - count);
        };

        return {
            gameState,
            difficulty,
            cards,
            score,
            timer,
            moves,
            consecutiveMatches,
            pairsCount,
            startGame,
            flipCard,
            resetGame,
            formatTime,
            calculateStars,
            getStarsDisplay
        };
    },
    template: `
        <div class="game-container">
            <h1 class="title">记忆翻牌小游戏</h1>

            <template v-if="gameState === 'start'">
                <div class="start-screen">
                    <p>选择难度，开始挑战你的记忆力！</p>
                    <div class="difficulty-select">
                        <button 
                            class="difficulty-btn" 
                            :class="{ active: difficulty === 'easy' }"
                            @click="difficulty = 'easy'"
                        >
                            简单 (6对)
                        </button>
                        <button 
                            class="difficulty-btn" 
                            :class="{ active: difficulty === 'medium' }"
                            @click="difficulty = 'medium'"
                        >
                            中等 (8对)
                        </button>
                        <button 
                            class="difficulty-btn" 
                            :class="{ active: difficulty === 'hard' }"
                            @click="difficulty = 'hard'"
                        >
                            困难 (12对)
                        </button>
                    </div>
                    <button class="btn btn-primary" @click="startGame">
                        开始游戏
                    </button>
                </div>
            </template>

            <template v-else-if="gameState === 'playing'">
                <div class="game-header">
                    <div class="info-item">
                        <div class="info-label">用时</div>
                        <div class="info-value">{{ formatTime(timer) }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">步数</div>
                        <div class="info-value">{{ moves }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">得分</div>
                        <div class="info-value">{{ score }}</div>
                    </div>
                </div>
                <div class="combo-display" v-if="consecutiveMatches > 1">
                    🔥 连击 x{{ consecutiveMatches }}！
                </div>
                <div class="cards-grid" :class="difficulty">
                    <div 
                        v-for="card in cards" 
                        :key="card.id"
                        class="card"
                        :class="{ flipped: card.isFlipped, matched: card.isMatched }"
                        @click="flipCard(card)"
                    >
                        <div class="card-inner">
                            <div class="card-front">?</div>
                            <div class="card-back">{{ card.icon }}</div>
                        </div>
                    </div>
                </div>
                <div class="button-group">
                    <button class="btn btn-secondary" @click="resetGame">
                        重新开始
                    </button>
                </div>
            </template>

            <template v-else-if="gameState === 'win'">
                <div class="win-screen">
                    <h2>🎉 恭喜获胜！</h2>
                    <div class="stars-display">{{ getStarsDisplay(calculateStars()) }}</div>
                    <div class="win-stats">
                        <div class="win-stat">
                            <div class="win-stat-label">完成时间</div>
                            <div class="win-stat-value">{{ formatTime(timer) }}</div>
                        </div>
                        <div class="win-stat">
                            <div class="win-stat-label">总步数</div>
                            <div class="win-stat-value">{{ moves }}</div>
                        </div>
                        <div class="win-stat">
                            <div class="win-stat-label">最终得分</div>
                            <div class="win-stat-value">{{ score }}</div>
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="btn btn-secondary" @click="resetGame">
                            重新开始
                        </button>
                    </div>
                </div>
            </template>
        </div>
    `
});

app.mount('#app');
