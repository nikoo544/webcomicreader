// Asteroids 2025 - High Dynamism & Game Feel
(() => {
    // --- Setup & Configuration ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // High DPI setup
    const dpr = window.devicePixelRatio || 1;

    let width, height;
    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- Audio Synthesis (Web Audio API) ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    const playSound = (type) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        if (type === 'shoot') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'shotgun') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'thrust') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(50, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'dash') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    };

    // --- Game State ---
    const state = {
        score: 0,
        gameOver: false,
        shake: 0,
        level: 1
    };

    // --- UI Injection ---
    const scoreEl = document.getElementById('score');
    const hud = document.querySelector('.hud');
    if (hud) {
        hud.style.fontFamily = '"Segoe UI", sans-serif';
        hud.style.textTransform = 'uppercase';
        hud.style.letterSpacing = '2px';
        hud.style.textShadow = '0 0 10px #00f2ff';
        hud.style.color = '#fff';
    }

    // News/System Ticker
    const newsEl = document.getElementById('news') || document.createElement('div');
    if (!document.getElementById('news')) {
        newsEl.id = 'news';
        document.body.appendChild(newsEl);
        Object.assign(newsEl.style, {
            position: 'fixed', top: '60px', width: '100%', textAlign: 'center',
            color: '#00f2ff', fontSize: '1.5rem', fontWeight: 'bold',
            textShadow: '0 0 20px #00f2ff', pointerEvents: 'none', zIndex: '100',
            fontFamily: 'monospace', opacity: '0', transition: 'opacity 0.3s'
        });
    }

    const showMessage = (text) => {
        newsEl.textContent = text;
        newsEl.style.opacity = '1';
        newsEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            newsEl.style.opacity = '0';
            newsEl.style.transform = 'scale(1)';
        }, 2000);
    };

    // --- Input ---
    const keys = {};
    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);

    // --- Vector Math Helpers ---
    const vec = {
        add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
        sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
        mult: (v, s) => ({ x: v.x * s, y: v.y * s }),
        mag: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
        norm: (v) => { const m = Math.sqrt(v.x * v.x + v.y * v.y); return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m }; },
        rot: (v, a) => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) })
    };

    // --- Entities ---
    class Entity {
        constructor(x, y) {
            this.pos = { x, y };
            this.vel = { x: 0, y: 0 };
            this.acc = { x: 0, y: 0 };
            this.angle = 0;
            this.radius = 10;
            this.color = '#fff';
            this.dead = false;
            this.glow = 15;
        }

        update() {
            this.vel = vec.add(this.vel, this.acc);
            this.pos = vec.add(this.pos, this.vel);
            this.acc = { x: 0, y: 0 };

            // Screen wrap
            if (this.pos.x < -this.radius) this.pos.x = width + this.radius;
            if (this.pos.x > width + this.radius) this.pos.x = -this.radius;
            if (this.pos.y < -this.radius) this.pos.y = height + this.radius;
            if (this.pos.y > height + this.radius) this.pos.y = -this.radius;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(this.angle);
            ctx.shadowBlur = this.glow;
            ctx.shadowColor = this.color;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            this.drawShape(ctx);
            ctx.stroke();
            ctx.restore();
        }

        drawShape(ctx) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        }
    }

    class Player extends Entity {
        constructor() {
            super(width / 2, height / 2);
            this.radius = 15;
            this.color = '#00f2ff';
            this.friction = 0.98;
            this.rotSpeed = 0.1;
            this.thrust = 0.15;
            this.cooldown = 0;
            this.weapon = 'blaster'; // blaster, shotgun
            this.dashCooldown = 0;
        }

        update() {
            if (keys['ArrowLeft'] || keys['KeyA']) this.angle -= this.rotSpeed;
            if (keys['ArrowRight'] || keys['KeyD']) this.angle += this.rotSpeed;

            if (keys['ArrowUp'] || keys['KeyW']) {
                const force = { x: Math.cos(this.angle - Math.PI / 2) * this.thrust, y: Math.sin(this.angle - Math.PI / 2) * this.thrust };
                this.acc = vec.add(this.acc, force);

                // Thrust particles
                for (let i = 0; i < 2; i++) {
                    const offset = vec.rot({ x: (Math.random() - 0.5) * 10, y: 15 }, this.angle);
                    particles.push(new Particle(
                        this.pos.x + offset.x,
                        this.pos.y + offset.y,
                        vec.add(this.vel, vec.mult(force, -5)),
                        '#00f2ff'
                    ));
                }
                if (Math.random() < 0.2) playSound('thrust');
            }

            // Dash
            if (this.dashCooldown > 0) this.dashCooldown--;
            if ((keys['ShiftLeft'] || keys['ShiftRight']) && this.dashCooldown <= 0) {
                const dashForce = { x: Math.cos(this.angle - Math.PI / 2) * 10, y: Math.sin(this.angle - Math.PI / 2) * 10 };
                this.vel = vec.add(this.vel, dashForce);
                this.dashCooldown = 60; // 1 second
                playSound('dash');
                state.shake += 5;
                // Dash particles
                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle(this.pos.x, this.pos.y, vec.mult(dashForce, -0.5), '#ffffff', 1, 20));
                }
            }

            // Weapon Switch
            if (keys['KeyQ'] && !this.switchPressed) {
                this.weapon = this.weapon === 'blaster' ? 'shotgun' : 'blaster';
                showMessage(`WEAPON: ${this.weapon.toUpperCase()}`);
                this.switchPressed = true;
            }
            if (!keys['KeyQ']) this.switchPressed = false;

            this.vel = vec.mult(this.vel, this.friction);
            super.update();

            // Shooting
            if (this.cooldown > 0) this.cooldown--;
            if (keys['Space'] && this.cooldown <= 0) {
                this.shoot();
            }
        }

        shoot() {
            const muzzle = vec.rot({ x: 0, y: -20 }, this.angle);
            const pos = vec.add(this.pos, muzzle);

            if (this.weapon === 'blaster') {
                const vel = vec.rot({ x: 0, y: -10 }, this.angle);
                bullets.push(new Bullet(pos.x, pos.y, vec.add(this.vel, vel)));
                playSound('shoot');
                this.cooldown = 10;
                state.shake += 2;
            } else if (this.weapon === 'shotgun') {
                for (let i = -1; i <= 1; i++) {
                    const spread = i * 0.15;
                    const vel = vec.rot({ x: 0, y: -10 }, this.angle + spread);
                    bullets.push(new Bullet(pos.x, pos.y, vec.add(this.vel, vel), 1.5, '#ff00aa', 40));
                }
                playSound('shotgun');
                this.cooldown = 30;
                state.shake += 5;
                // Recoil
                const recoil = { x: Math.cos(this.angle + Math.PI / 2) * 2, y: Math.sin(this.angle + Math.PI / 2) * 2 };
                this.vel = vec.add(this.vel, recoil);
            }
        }

        drawShape(ctx) {
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(12, 15);
            ctx.lineTo(0, 10);
            ctx.lineTo(-12, 15);
            ctx.closePath();

            // Draw weapon indicator
            if (this.weapon === 'shotgun') {
                ctx.fillStyle = '#ff00aa';
                ctx.fill();
            }
        }
    }

    class Bullet extends Entity {
        constructor(x, y, vel, size = 2, color = '#ffea00', life = 60) {
            super(x, y);
            this.vel = vel;
            this.radius = size;
            this.color = color;
            this.life = life;
        }

        update() {
            super.update();
            this.life--;
            if (this.life <= 0) this.dead = true;

            // Trail
            particles.push(new Particle(this.pos.x, this.pos.y, { x: 0, y: 0 }, this.color, 0.5, 10));
        }

        drawShape(ctx) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    class Asteroid extends Entity {
        constructor(x, y, size = 3) {
            super(x, y);
            this.size = size; // 3: Large, 2: Medium, 1: Small
            this.radius = size * 15;
            this.color = '#ff0066';
            const speed = (4 - size) * 0.5;
            const angle = Math.random() * Math.PI * 2;
            this.vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
            this.rotSpeed = (Math.random() - 0.5) * 0.1;

            // Generate jagged shape
            this.points = [];
            const numPoints = 8 + Math.floor(Math.random() * 6);
            for (let i = 0; i < numPoints; i++) {
                const a = (i / numPoints) * Math.PI * 2;
                const r = this.radius * (0.8 + Math.random() * 0.4);
                this.points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
            }
        }

        update() {
            super.update();
            this.angle += this.rotSpeed;
        }

        drawShape(ctx) {
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.closePath();
        }

        break() {
            this.dead = true;
            // Explosion particles
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.pos.x, this.pos.y, null, this.color));
            }
            playSound('explosion');
            state.shake += this.size * 3;

            if (this.size > 1) {
                for (let i = 0; i < 2; i++) {
                    asteroids.push(new Asteroid(this.pos.x, this.pos.y, this.size - 1));
                }
            }
        }
    }

    class Particle {
        constructor(x, y, vel, color, alpha = 1, life = 30) {
            this.pos = { x, y };
            this.vel = vel || { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 };
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.alpha = alpha;
            this.dead = false;
        }

        update() {
            this.pos = vec.add(this.pos, this.vel);
            this.life--;
            if (this.life <= 0) this.dead = true;
        }

        draw(ctx) {
            ctx.globalAlpha = (this.life / this.maxLife) * this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // --- Game Objects Lists ---
    let player = new Player();
    let bullets = [];
    let asteroids = [];
    let particles = [];

    // --- Level Management ---
    const startLevel = () => {
        showMessage(`NIVEL ${state.level}`);
        asteroids = [];
        const count = 3 + state.level;
        for (let i = 0; i < count; i++) {
            let x, y;
            // Spawn away from player
            do {
                x = Math.random() * width;
                y = Math.random() * height;
            } while (vec.mag(vec.sub({ x, y }, player.pos)) < 200);
            asteroids.push(new Asteroid(x, y));
        }
    };

    startLevel();

    // --- Main Loop ---
    const loop = () => {
        requestAnimationFrame(loop);

        // Clear with trail effect
        ctx.fillStyle = 'rgba(10, 11, 16, 0.4)'; // Trail effect
        ctx.fillRect(0, 0, width, height);

        // Screen Shake
        if (state.shake > 0) {
            const dx = (Math.random() - 0.5) * state.shake;
            const dy = (Math.random() - 0.5) * state.shake;
            ctx.save();
            ctx.translate(dx, dy);
            state.shake *= 0.9;
            if (state.shake < 0.5) state.shake = 0;
        }

        // Update & Draw Player
        if (!player.dead) {
            player.update();
            player.draw(ctx);
        }

        // Update & Draw Bullets
        bullets = bullets.filter(b => !b.dead);
        bullets.forEach(b => {
            b.update();
            b.draw(ctx);
        });

        // Update & Draw Asteroids
        asteroids = asteroids.filter(a => !a.dead);
        asteroids.forEach(a => {
            a.update();
            a.draw(ctx);

            // Collision: Bullet vs Asteroid
            bullets.forEach(b => {
                if (!b.dead && vec.mag(vec.sub(a.pos, b.pos)) < a.radius) {
                    a.break();
                    b.dead = true;
                    state.score += 100 * (4 - a.size);
                    scoreEl.textContent = state.score;
                }
            });

            // Collision: Player vs Asteroid
            if (!player.dead && vec.mag(vec.sub(a.pos, player.pos)) < a.radius + player.radius) {
                player.dead = true;
                state.shake += 20;
                playSound('explosion');
                // Big explosion
                for (let i = 0; i < 50; i++) particles.push(new Particle(player.pos.x, player.pos.y, null, '#00f2ff'));
                showMessage("GAME OVER - R para Reiniciar");
            }
        });

        // Level Complete
        if (asteroids.length === 0) {
            state.level++;
            bullets = [];
            player.pos = { x: width / 2, y: height / 2 };
            player.vel = { x: 0, y: 0 };
            startLevel();
        }

        // Update & Draw Particles
        particles = particles.filter(p => !p.dead);
        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });

        if (state.shake > 0) ctx.restore();

        // Restart
        if (player.dead && (keys['KeyR'] || keys['KeyX'])) {
            player = new Player();
            state.score = 0;
            state.level = 1;
            scoreEl.textContent = 0;
            startLevel();
        }
    };

    loop();
})();
