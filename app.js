const { createApp, ref, onMounted, onUnmounted } = Vue;

createApp({
    setup() {
        const gameCanvas = ref(null);
        
        const canvasWidth = 600;
        const canvasHeight = 500;
        const maxLives = 3;
        
        const score = ref(0);
        const lives = ref(maxLives);
        const isPlaying = ref(false);
        const isGameOver = ref(false);
        const gameTime = ref(0);
        
        const paddle = {
            x: canvasWidth / 2 - 60,
            y: canvasHeight - 40,
            width: 120,
            height: 15,
            speed: 8,
            color: '#667eea'
        };
        
        const items = ref([]);
        const keys = { left: false, right: false };
        let animationId = null;
        let spawnTimer = null;
        let gameTimer = null;
        let ctx = null;
        let lastTouchX = null;
        
        const ITEM_TYPES = {
            STAR: { type: 'star', color: '#ffd700', points: 10, size: 25 },
            DIAMOND: { type: 'diamond', color: '#00ffff', points: 25, size: 22 },
            BOMB: { type: 'bomb', color: '#ff4757', points: -1, size: 28 },
            FAST_BOMB: { type: 'bomb', color: '#ff0000', points: -1, size: 22, isFast: true },
            ULTRA_STAR: { type: 'star', color: '#ffaa00', points: 50, size: 35, isUltra: true }
        };
        
        const getDifficulty = () => {
            const timeFactor = Math.min(gameTime.value / 60, 5);
            const scoreFactor = Math.min(score.value / 200, 5);
            return Math.min(timeFactor + scoreFactor, 8);
        };
        
        const getSpawnInterval = () => {
            const difficulty = getDifficulty();
            const base = 1000;
            const reduction = difficulty * 80;
            return Math.max(base - reduction, 300);
        };
        
        const getBaseSpeed = () => {
            const difficulty = getDifficulty();
            return 2 + difficulty * 0.5;
        };
        
        const spawnItem = () => {
            const difficulty = getDifficulty();
            const random = Math.random();
            let itemType;
            
            if (difficulty >= 5 && random < 0.1) {
                itemType = ITEM_TYPES.ULTRA_STAR;
            } else if (difficulty >= 3 && random < 0.25) {
                itemType = ITEM_TYPES.FAST_BOMB;
            } else if (random < 0.45) {
                itemType = ITEM_TYPES.STAR;
            } else if (random < 0.70) {
                itemType = ITEM_TYPES.DIAMOND;
            } else {
                itemType = ITEM_TYPES.BOMB;
            }
            
            const baseSpeed = getBaseSpeed();
            const speedVariation = itemType.isFast ? 3 : (itemType.isUltra ? -1 : 0);
            
            const newItem = {
                x: Math.random() * (canvasWidth - 50) + 25,
                y: -30,
                ...itemType,
                speed: baseSpeed + Math.random() * 2 + speedVariation,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * (itemType.isFast ? 0.2 : 0.1)
            };
            
            items.value.push(newItem);
            
            if (difficulty >= 4 && Math.random() < 0.3) {
                const extraItem = {
                    x: Math.random() * (canvasWidth - 50) + 25,
                    y: -30,
                    ...(Math.random() < 0.6 ? ITEM_TYPES.BOMB : ITEM_TYPES.FAST_BOMB),
                    speed: baseSpeed + Math.random() * 2,
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.15
                };
                items.value.push(extraItem);
            }
        };
        
        const drawPaddle = () => {
            const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
            gradient.addColorStop(0, '#764ba2');
            gradient.addColorStop(1, '#667eea');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
            ctx.fill();
            
            ctx.shadowColor = '#667eea';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        };
        
        const drawStar = (item) => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation || 0);
            ctx.fillStyle = item.color;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = item.isUltra ? 20 : 10;
            
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * (item.size / 2);
                const y = Math.sin(angle) * (item.size / 2);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };
        
        const drawDiamond = (item) => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation || 0);
            ctx.fillStyle = item.color;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.moveTo(0, -item.size / 2);
            ctx.lineTo(item.size / 2, 0);
            ctx.lineTo(0, item.size / 2);
            ctx.lineTo(-item.size / 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };
        
        const drawBomb = (item) => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation || 0);
            
            ctx.fillStyle = item.color;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = item.isFast ? 18 : 10;
            ctx.beginPath();
            ctx.arc(0, 0, item.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#2f3542';
            ctx.fillRect(-3, -item.size / 2 - 8, 6, 10);
            
            ctx.fillStyle = item.isFast ? '#ff0000' : '#ffa502';
            ctx.beginPath();
            ctx.arc(0, -item.size / 2 - 12, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        };
        
        const drawItem = (item) => {
            if (item.type === 'star') {
                drawStar(item);
            } else if (item.type === 'diamond') {
                drawDiamond(item);
            } else {
                drawBomb(item);
            }
        };
        
        const checkCollision = (item) => {
            const itemRadius = item.size / 2;
            return (
                item.y + itemRadius > paddle.y &&
                item.y - itemRadius < paddle.y + paddle.height &&
                item.x + itemRadius > paddle.x &&
                item.x - itemRadius < paddle.x + paddle.width
            );
        };
        
        let lastDifficultyUpdate = 0;
        
        const update = () => {
            if (keys.left) {
                paddle.x = Math.max(0, paddle.x - paddle.speed);
            }
            if (keys.right) {
                paddle.x = Math.min(canvasWidth - paddle.width, paddle.x + paddle.speed);
            }
            
            items.value.forEach((item, index) => {
                item.y += item.speed;
                item.rotation += item.rotationSpeed;
                
                if (checkCollision(item)) {
                    if (item.type === 'bomb') {
                        lives.value--;
                        if (lives.value <= 0) {
                            endGame();
                        }
                    } else {
                        score.value += item.points;
                    }
                    items.value.splice(index, 1);
                } else if (item.y > canvasHeight + 50) {
                    items.value.splice(index, 1);
                }
            });
            
            const now = Date.now();
            if (now - lastDifficultyUpdate > 1000) {
                lastDifficultyUpdate = now;
                updateSpawnRate();
            }
        };
        
        let currentSpawnInterval = 1000;
        
        const updateSpawnRate = () => {
            const newInterval = getSpawnInterval();
            if (Math.abs(newInterval - currentSpawnInterval) > 50) {
                currentSpawnInterval = newInterval;
                if (spawnTimer) {
                    clearInterval(spawnTimer);
                }
                spawnTimer = setInterval(() => {
                    if (isPlaying.value) {
                        spawnItem();
                    }
                }, currentSpawnInterval);
            }
        };
        
        const draw = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            const difficulty = getDifficulty();
            ctx.strokeStyle = `rgba(102, 126, 234, ${0.05 + difficulty * 0.02})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < canvasWidth; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvasHeight);
                ctx.stroke();
            }
            for (let i = 0; i < canvasHeight; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvasWidth, i);
                ctx.stroke();
            }
            
            items.value.forEach(drawItem);
            drawPaddle();
        };
        
        const gameLoop = () => {
            update();
            draw();
            animationId = requestAnimationFrame(gameLoop);
        };
        
        const startGame = () => {
            score.value = 0;
            lives.value = maxLives;
            isPlaying.value = true;
            isGameOver.value = false;
            gameTime.value = 0;
            items.value = [];
            paddle.x = canvasWidth / 2 - paddle.width / 2;
            
            if (gameCanvas.value) {
                gameCanvas.value.focus();
            }
            
            gameTimer = setInterval(() => {
                if (isPlaying.value) {
                    gameTime.value++;
                }
            }, 1000);
            
            gameLoop();
            spawnItem();
            spawnTimer = setInterval(() => {
                if (isPlaying.value) {
                    spawnItem();
                }
            }, getSpawnInterval());
        };
        
        const endGame = () => {
            isPlaying.value = false;
            isGameOver.value = true;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (spawnTimer) {
                clearInterval(spawnTimer);
            }
            if (gameTimer) {
                clearInterval(gameTimer);
            }
        };
        
        const resetGame = () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (spawnTimer) {
                clearInterval(spawnTimer);
            }
            if (gameTimer) {
                clearInterval(gameTimer);
            }
            items.value = [];
            startGame();
        };
        
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = true;
            }
        };
        
        const handleKeyUp = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = false;
            }
        };
        
        const handleTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = gameCanvas.value.getBoundingClientRect();
            lastTouchX = touch.clientX - rect.left;
        };
        
        const handleTouchMove = (e) => {
            e.preventDefault();
            if (lastTouchX === null) return;
            
            const touch = e.touches[0];
            const rect = gameCanvas.value.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const diff = touchX - lastTouchX;
            
            paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, paddle.x + diff));
            lastTouchX = touchX;
        };
        
        onMounted(() => {
            ctx = gameCanvas.value.getContext('2d');
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            draw();
        });
        
        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (spawnTimer) {
                clearInterval(spawnTimer);
            }
            if (gameTimer) {
                clearInterval(gameTimer);
            }
        });
        
        return {
            gameCanvas,
            canvasWidth,
            canvasHeight,
            score,
            lives,
            maxLives,
            isPlaying,
            isGameOver,
            gameTime,
            getDifficulty,
            startGame,
            resetGame,
            handleKeyDown,
            handleTouchStart,
            handleTouchMove,
            handleTouchEnd
        };
    }
}).mount('#app');
