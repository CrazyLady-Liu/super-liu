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
        let ctx = null;
        let lastTouchX = null;
        
        const ITEM_TYPES = {
            STAR: { type: 'star', color: '#ffd700', points: 10, size: 25 },
            DIAMOND: { type: 'diamond', color: '#00ffff', points: 25, size: 22 },
            BOMB: { type: 'bomb', color: '#ff4757', points: -1, size: 28 }
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
            ctx.shadowBlur = 10;
            
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
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, item.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#2f3542';
            ctx.fillRect(-3, -item.size / 2 - 8, 6, 10);
            
            ctx.fillStyle = '#ffa502';
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
        
        const spawnItem = () => {
            const random = Math.random();
            let itemType;
            
            if (random < 0.5) {
                itemType = ITEM_TYPES.STAR;
            } else if (random < 0.8) {
                itemType = ITEM_TYPES.DIAMOND;
            } else {
                itemType = ITEM_TYPES.BOMB;
            }
            
            const newItem = {
                x: Math.random() * (canvasWidth - 50) + 25,
                y: -30,
                ...itemType,
                speed: 2 + Math.random() * 2 + score.value / 100,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            };
            
            items.value.push(newItem);
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
        };
        
        const draw = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.1)';
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
            items.value = [];
            paddle.x = canvasWidth / 2 - paddle.width / 2;
            
            if (gameCanvas.value) {
                gameCanvas.value.focus();
            }
            
            gameLoop();
            spawnTimer = setInterval(() => {
                if (isPlaying.value) {
                    spawnItem();
                }
            }, 1000 - Math.min(score.value * 2, 500));
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
        };
        
        const resetGame = () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (spawnTimer) {
                clearInterval(spawnTimer);
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
        
        const handleTouchEnd = () => {
            lastTouchX = null;
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
            startGame,
            resetGame,
            handleKeyDown,
            handleTouchStart,
            handleTouchMove,
            handleTouchEnd
        };
    }
}).mount('#app');
