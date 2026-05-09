const { createApp, ref } = Vue;

const choices = [
    { id: 'rock', name: '石头', icon: '✊' },
    { id: 'scissors', name: '剪刀', icon: '✌️' },
    { id: 'paper', name: '布', icon: '🖐️' }
];

const app = createApp({
    setup() {
        const gameState = ref('start');
        const playerChoice = ref(null);
        const computerChoice = ref(null);
        const playerScore = ref(0);
        const computerScore = ref(0);
        const result = ref(null);
        const isPlaying = ref(false);

        const startGame = () => {
            gameState.value = 'playing';
            resetRound();
        };

        const resetRound = () => {
            playerChoice.value = null;
            computerChoice.value = null;
            result.value = null;
            isPlaying.value = false;
        };

        const computerPlay = () => {
            const randomIndex = Math.floor(Math.random() * choices.length);
            return choices[randomIndex];
        };

        const determineWinner = (player, computer) => {
            if (player.id === computer.id) {
                return 'draw';
            }
            
            if (
                (player.id === 'rock' && computer.id === 'scissors') ||
                (player.id === 'scissors' && computer.id === 'paper') ||
                (player.id === 'paper' && computer.id === 'rock')
            ) {
                return 'win';
            }
            
            return 'lose';
        };

        const play = (choice) => {
            if (isPlaying.value) return;
            
            isPlaying.value = true;
            playerChoice.value = choice;
            
            setTimeout(() => {
                computerChoice.value = computerPlay();
                
                const gameResult = determineWinner(playerChoice.value, computerChoice.value);
                result.value = gameResult;
                
                if (gameResult === 'win') {
                    playerScore.value++;
                } else if (gameResult === 'lose') {
                    computerScore.value++;
                }
                
                isPlaying.value = false;
            }, 500);
        };

        const resetGame = () => {
            gameState.value = 'start';
            playerScore.value = 0;
            computerScore.value = 0;
            resetRound();
        };

        const getResultText = () => {
            if (result.value === 'win') {
                return '🎉 你赢了！';
            } else if (result.value === 'lose') {
                return '😢 你输了！';
            } else if (result.value === 'draw') {
                return '🤝 平局！';
            }
            return '';
        };

        const getResultClass = () => {
            if (result.value === 'win') {
                return 'result-win';
            } else if (result.value === 'lose') {
                return 'result-lose';
            } else if (result.value === 'draw') {
                return 'result-draw';
            }
            return '';
        };

        return {
            gameState,
            choices,
            playerChoice,
            computerChoice,
            playerScore,
            computerScore,
            result,
            isPlaying,
            startGame,
            play,
            resetGame,
            getResultText,
            getResultClass
        };
    },
    template: `
        <div class="game-container">
            <h1 class="title">石头剪刀布对战</h1>

            <template v-if="gameState === 'start'">
                <div class="start-screen">
                    <p class="subtitle">和电脑来一场石头剪刀布对决吧！</p>
                    <ul class="rules-list">
                        <li>✊ 石头 克制 ✌️ 剪刀</li>
                        <li>✌️ 剪刀 克制 🖐️ 布</li>
                        <li>🖐️ 布 克制 ✊ 石头</li>
                    </ul>
                    <button class="btn btn-primary" @click="startGame">
                        开始游戏
                    </button>
                </div>
            </template>

            <template v-else-if="gameState === 'playing'">
                <div class="game-screen">
                    <div class="score-board">
                        <div class="score-item">
                            <div class="score-label">你</div>
                            <div class="score-value">{{ playerScore }}</div>
                        </div>
                        <div class="vs-text">VS</div>
                        <div class="score-item">
                            <div class="score-label">电脑</div>
                            <div class="score-value">{{ computerScore }}</div>
                        </div>
                    </div>

                    <div class="battle-area">
                        <div class="choice-display">
                            <div class="choice-label">你</div>
                            <span class="choice-icon">{{ playerChoice ? playerChoice.icon : '' }}</span>
                        </div>
                        <div class="vs-text">VS</div>
                        <div class="choice-display">
                            <div class="choice-label">电脑</div>
                            <span class="choice-icon">{{ computerChoice ? computerChoice.icon : '' }}</span>
                        </div>
                    </div>

                    <div class="result-display" :class="getResultClass()" v-if="result">
                        <div class="result-text">{{ getResultText() }}</div>
                    </div>

                    <div class="choices-buttons">
                        <button 
                            v-for="choice in choices" 
                            :key="choice.id"
                            class="choice-btn"
                            :disabled="isPlaying || (playerChoice && !computerChoice)"
                            @click="play(choice)"
                        >
                            {{ choice.icon }}
                        </button>
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
