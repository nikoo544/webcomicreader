(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Ajuste del canvas al tamaño de la ventana
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // -------------------------------------------------
    // 1️⃣ Entidades del juego
    // -------------------------------------------------
    const player = {
        x: canvas.width / 2,
        y: canvas.height - 80,
        w: 40,
        h: 40,
        speed: 6,
        color: '#00f2ff'
    };

    const bullets = [];   // disparos del jugador
    const enemies = [];   // naves enemigas
    let score = 0;
    const scoreEl = document.getElementById('score');

    // -------------------------------------------------
    // 2️⃣ Controles
    // -------------------------------------------------
    const keys = {};
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);

    // -------------------------------------------------
    // 3️⃣ Funciones de actualización
    // -------------------------------------------------
    function movePlayer() {
        if (keys.ArrowLeft || keys.a) player.x -= player.speed;
        if (keys.ArrowRight || keys.d) player.x += player.speed;
        // Mantener dentro del canvas
        player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    }

    let lastShot = 0;
    function shoot() {
        if (keys.Space && (Date.now() - lastShot > 200)) {
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
    }

    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.y -= b.speed;
            if (b.y + b.h < 0) bullets.splice(i, 1);
        }
    }

    let lastEnemy = 0;
    function spawnEnemy() {
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
    }

    function updateEnemies() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.y += e.speed;
            if (e.y > canvas.height) enemies.splice(i, 1);
        }
    }

    function checkCollisions() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j];
                if (b.x < e.x + e.w && b.x + b.w > e.x &&
                    b.y < e.y + e.h && b.y + b.h > e.y) {
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                    score += 10;
                    scoreEl.textContent = score;
                    break;
                }
            }
        }
    }

    // -------------------------------------------------
    // 4️⃣ Renderizado
    // -------------------------------------------------
    function drawRect(obj) {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Dibujar jugador (triángulo)
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y + player.h);
        ctx.lineTo(player.x + player.w / 2, player.y);
        ctx.lineTo(player.x + player.w, player.y + player.h);
        ctx.closePath();
        ctx.fill();
        bullets.forEach(drawRect);
        enemies.forEach(drawRect);
    }

    // -------------------------------------------------
    // 5️⃣ Loop principal
    // -------------------------------------------------
    function loop() {
        movePlayer();
        shoot();
        updateBullets();
        spawnEnemy();
        updateEnemies();
        checkCollisions();
        render();
        requestAnimationFrame(loop);
    }
    loop();
})();
