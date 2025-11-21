// Space Shooter Mini‑Game – Enhanced version with shooting, explosions, collectibles and news ticker
(() => {
    // Canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // UI elements
    const scoreEl = document.getElementById('score');
    const newsEl = document.createElement('div');
    newsEl.id = 'news';
    Object.assign(newsEl.style, {
        position: 'fixed', top: '0', width: '100%', padding: '0.5rem 1rem',
        background: 'rgba(0,0,0,0.7)', color: '#fff', textAlign: 'center',
        fontSize: '1rem', zIndex: '20', pointerEvents: 'none'
    });
    document.body.appendChild(newsEl);
    const newsMessages = [
        '¡Nuevo nivel desbloqueado! 🎉',
        'Recoge estrellas para ganar puntos extra ⭐',
        '¡Dispara rápido y destruye todo! 🚀',
        '¡Power‑ups en camino! ⚡'
    ];
    const showNews = () => {
        const msg = newsMessages[Math.floor(Math.random() * newsMessages.length)];
        newsEl.textContent = msg;
        setTimeout(() => { newsEl.textContent = ''; }, 3000);
    };

    // Game objects
    const player = { x: canvas.width / 2, y: canvas.height - 80, w: 40, h: 40, speed: 6, color: '#00f2ff' };
    const bullets = [];
    const enemies = [];
    const particles = [];
    const collectibles = [];
    let score = 0;
    scoreEl.textContent = score;

    // Input handling
    const keys = {};
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);

    // Player movement
    const movePlayer = () => {
        if (keys.ArrowLeft || keys.a) player.x -= player.speed;
        if (keys.ArrowRight || keys.d) player.x += player.speed;
        player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    };

    // Shooting
    let lastShot = 0;
    const shoot = () => {
        if (keys.Space && Date.now() - lastShot > 200) {
            bullets.push({
                x: player.x + player.w / 2 - 4,
                y: player.y,
                w: 8,
                h: 15,
                speed: 8,
                color: '#ffea00'
            });
            lastShot = Date.now();
        }
    };
    const updateBullets = () => {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.y -= b.speed;
            if (b.y + b.h < 0) bullets.splice(i, 1);
        }
    };

    // Enemy spawning
    let lastEnemy = 0;
    const spawnEnemy = () => {
        if (Date.now() - lastEnemy > 1500) {
            const size = 30 + Math.random() * 20;
            enemies.push({
                x: Math.random() * (canvas.width - size),
                y: -size,
                w: size,
                h: size,
                speed: 2 + Math.random() * 2,
                color: '#ff0066'
            });
            lastEnemy = Date.now();
        }
    };
    const updateEnemies = () => {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.y += e.speed;
            if (e.y > canvas.height) enemies.splice(i, 1);
        }
    };

    // Collectible spawning
    let lastCollect = 0;
    const spawnCollectible = () => {
        if (Date.now() - lastCollect > 5000) {
            const size = 20;
            collectibles.push({
                x: Math.random() * (canvas.width - size),
                y: -size,
                w: size,
                h: size,
                speed: 1.5,
                color: '#ffd700' // gold
            });
            lastCollect = Date.now();
        }
    };
    const updateCollectibles = () => {
        for (let i = collectibles.length - 1; i >= 0; i--) {
            const c = collectibles[i];
            c.y += c.speed;
            if (c.y > canvas.height) collectibles.splice(i, 1);
        }
    };

    // Particle explosions
    const createExplosion = (x, y) => {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30,
                size: 4,
                color: '#ff0066'
            });
        }
    };
    const updateParticles = () => {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }
    };

    // Collision detection
    const checkCollisions = () => {
        // bullets vs enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j];
                if (b.x < e.x + e.w && b.x + b.w > e.x &&
                    b.y < e.y + e.h && b.y + b.h > e.y) {
                    createExplosion(e.x + e.w / 2, e.y + e.h / 2);
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                    score += 10;
                    scoreEl.textContent = score;
                    showNews();
                    break;
                }
            }
        }
        // player vs collectibles
        for (let i = collectibles.length - 1; i >= 0; i--) {
            const c = collectibles[i];
            if (player.x < c.x + c.w && player.x + player.w > c.x &&
                player.y < c.y + c.h && player.y + player.h > c.y) {
                collectibles.splice(i, 1);
                score += 20; // bonus points
                scoreEl.textContent = score;
                showNews();
            }
        }
    };

    // Rendering helpers
    const drawRect = obj => {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    };
    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Player (triangle)
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y + player.h);
        ctx.lineTo(player.x + player.w / 2, player.y);
        ctx.lineTo(player.x + player.w, player.y + player.h);
        ctx.closePath();
        ctx.fill();
        // Bullets, enemies, collectibles
        bullets.forEach(drawRect);
        enemies.forEach(drawRect);
        collectibles.forEach(drawRect);
        // Particles (explosions)
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 30;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    };

    // Main loop
    const loop = () => {
        movePlayer();
        shoot();
        updateBullets();
        spawnEnemy();
        updateEnemies();
        spawnCollectible();
        updateCollectibles();
        updateParticles();
        checkCollisions();
        render();
        requestAnimationFrame(loop);
    };
    loop();
})();
