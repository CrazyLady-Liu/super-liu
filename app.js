const { createApp, ref, computed, nextTick } = Vue;

const app = createApp({
    setup() {
        const gameState = ref('ready');
        const count = ref(0);
        const timeLeft = ref(10);
        const isClickAnimating = ref(false);
        let timer = null;

        const clicksPerSecond = computed(() => {
            if (count.value === 0) return 0;
            return (count.value / 10).toFixed(2);
        });

        const startGame = () => {
            gameState.value = 'playing';
            count.value = 0;
            timeLeft.value = 10;
            
            timer = setInterval(() => {
                timeLeft.value--;
                if (timeLeft.value <= 0) {
                    endGame();
                }
            }, 1000);
        };

        const handleClick = (event) => {
            if (gameState.value === 'playing') {
                count.value++;
                isClickAnimating.value = true;
                nextTick(() => {
                    isClickAnimating.value = false;
                });
            }
        };

        const endGame = () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            gameState.value = 'ended';
        };

        const resetGame = () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            gameState.value = 'ready';
            count.value = 0;
            timeLeft.value = 10;
        };

        return {
            gameState,
            count,
            timeLeft,
            clicksPerSecond,
            isClickAnimating,
            startGame,
            handleClick,
            resetGame
        };
    },
    template: `
        <div class="game-container">
            <h1 class="title">点击速度挑战</h1>
            
            <div class="timer-display" :class="{ warning: timeLeft <= 3 && gameState === 'playing' }">
                {{ timeLeft }}
            </div>

            <template v-if="gameState === 'ready'">
                <button class="btn btn-primary" @click="startGame">
                    开始挑战
                </button>
            </template>

            <template v-else-if="gameState === 'playing'">
                <div class="count-display" :class="{ pop: isClickAnimating }">{{ count }}</div>
                <button class="click-button" @click="handleClick">
                    点击我！
                </button>
            </template>

            <template v-else-if="gameState === 'ended'">
                <div class="result-container">
                    <div class="result-item">
                        总点击数：<span>{{ count }}</span>
                    </div>
                    <div class="result-item">
                        每秒点击：<span>{{ clicksPerSecond }}</span>
                    </div>
                </div>
                <button class="btn btn-primary" @click="resetGame">
                    重新挑战
                </button>
            </template>
        </div>
    `
});

app.mount('#app');
