// Space IO - Client Side Simulation (Vampire Survivors Style)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');

// Config
const WORLD_SIZE = 4000;
let width, height;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    minimapCanvas.width = 150;
    minimapCanvas.height = 150;
}
window.addEventListener('resize', resize);
resize();

// Game State
let gameState = 'START'; // START, PLAYING, LEVEL_UP, DEAD
let camera = { x: 0, y: 0 };
let gameTime = 0;
let difficultyMultiplier = 1;

// Assets / Utils
const NAMES = ["ProGamer", "NoobMaster", "SpaceAce", "GalaxyKing", "Destroyer", "Luna", "StarLord", "Viper", "Falcon", "Guest_832", "Zero", "Neo", "Trinity", "Xenon", "Quasar", "Nebula", "Void", "Cyber", "Glitch", "Kratos"];
const COLORS = ['#00f2ff', '#bd00ff', '#ff0055', '#00ff88', '#ffcc00', '#ffffff'];

function rand(min, max) { return Math.random() * (max - min) + min; }
function randColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

// Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'shoot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(rand(400, 600), now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'xp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'kill') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'levelup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }
}

// Entities
class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dead = false;
    }
}

class Ship extends Entity {
    constructor(x, y, name, isPlayer = false) {
        super(x, y, 20, isPlayer ? '#00f2ff' : randColor());
        this.name = name;
        this.isPlayer = isPlayer;
        this.angle = 0;
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };

        // Base Stats
        this.maxHp = 100;
        this.hp = 100;
        this.speed = isPlayer ? 5 : 2; // Bots start slow
        this.damage = 10;
        this.fireRate = 30;
        this.cooldown = 0;
        this.xp = 0;
        this.level = 1;
        this.score = 0;
        this.kills = 0;

        // Advanced Stats (Upgrades)
        this.projectileCount = 1;
        this.spread = 0.1;
        this.homing = 0; // 0 to 1 strength
        this.bounce = 0; // Number of bounces
        this.auraRadius = 0;
        this.auraDamage = 0;
        this.orbitals = 0;
        this.sizeMult = 1;

        // AI
        this.target = null;
        this.changeDirTimer = 0;
    }

    update() {
        // Physics
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        this.vel.x *= 0.95; // Friction
        this.vel.y *= 0.95;
        this.x += this.vel.x;
        this.y += this.vel.y;
        this.acc = { x: 0, y: 0 };

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > WORLD_SIZE) this.x = WORLD_SIZE;
        if (this.y < 0) this.y = 0;
        if (this.y > WORLD_SIZE) this.y = WORLD_SIZE;

        // Cooldown
        if (this.cooldown > 0) this.cooldown--;

        // Aura Damage
        if (this.auraRadius > 0 && gameTime % 30 === 0) {
            // Damage nearby enemies
            const targets = this.isPlayer ? [...ships, ...asteroids] : [player];
            targets.forEach(t => {
                if (t !== this && !t.dead && dist(this, t) < this.auraRadius) {
                    t.takeDamage(this.auraDamage, this);
                    // Visual effect
                    ctx.globalAlpha = 0.3;
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, t.radius + 10, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            });
        }

        // Level Up Logic
        const xpNeed = Math.floor(100 * Math.pow(1.2, this.level - 1));
        if (this.xp >= xpNeed) {
            this.xp -= xpNeed;
            this.level++;
            this.maxHp += 20;
            this.hp = this.maxHp;

            if (this.isPlayer) {
                playSound('levelup');
                gameState = 'LEVEL_UP';
                showUpgradeModal();
            } else {
                // AI Auto Upgrade
                this.damage *= 1.1;
                this.speed = Math.min(this.speed * 1.05, 8);
                this.hp = this.maxHp;
            }
        }

        // AI Behavior
        if (!this.isPlayer) {
            this.aiUpdate();
        }
    }

    aiUpdate() {
        // Simple AI: Wander or Chase
        if (!this.target || this.target.dead) {
            // Find target (usually player if close, else random ship)
            if (dist(this, player) < 800 && !player.dead) {
                this.target = player;
            } else {
                // Wander
                this.target = null;
            }
        }

        if (this.target) {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.angle = angle;
            this.acc.x = Math.cos(angle) * (this.speed * 0.1);
            this.acc.y = Math.sin(angle) * (this.speed * 0.1);

            if (dist(this, this.target) < 400 && this.cooldown <= 0) {
                this.shoot();
            }
        } else {
            // Wander
            this.changeDirTimer--;
            if (this.changeDirTimer <= 0) {
                this.angle = rand(0, Math.PI * 2);
                this.changeDirTimer = rand(60, 180);
            }
            this.acc.x = Math.cos(this.angle) * (this.speed * 0.05);
            this.acc.y = Math.sin(this.angle) * (this.speed * 0.05);
        }
    }

    shoot() {
        const startAngle = this.angle - (this.spread * (this.projectileCount - 1)) / 2;

        for (let i = 0; i < this.projectileCount; i++) {
            const angle = startAngle + (this.spread * i);
            const b = new Bullet(this.x, this.y, angle, this);
            bullets.push(b);
        }

        this.cooldown = this.fireRate;
        if (dist(this, player) < width) playSound('shoot');
    }

    takeDamage(amt, source) {
        this.hp -= amt;
        if (this.hp <= 0) {
            this.dead = true;
            // Drop XP
            const dropCount = 5 + this.level * 2;
            for (let i = 0; i < dropCount; i++) {
                orbs.push(new Orb(this.x + rand(-20, 20), this.y + rand(-20, 20), this.level * 10));
            }

            if (source) {
                source.score += 100 * this.level;
                source.kills++;
                if (source.isPlayer) playSound('kill');
            }

            if (this.isPlayer) {
                setTimeout(() => {
                    alert("GAME OVER! Score: " + Math.floor(this.score));
                    location.reload();
                }, 100);
            } else {
                // Respawn logic handled in global loop
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Aura Visual
        if (this.auraRadius > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.auraRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.1 + Math.sin(gameTime * 0.1) * 0.05;
            ctx.fill();
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Orbitals
        if (this.orbitals > 0) {
            const time = gameTime * 0.05;
            for (let i = 0; i < this.orbitals; i++) {
                const angle = time + (i * (Math.PI * 2 / this.orbitals));
                const ox = Math.cos(angle) * (this.radius + 30);
                const oy = Math.sin(angle) * (this.radius + 30);
                ctx.beginPath();
                ctx.arc(ox, oy, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                // Orbital collision logic (hacky but works for visual)
                // In a real engine this would be in update()
                if (this.isPlayer) {
                    const worldOx = this.x + ox;
                    const worldOy = this.y + oy;
                    [...ships, ...asteroids].forEach(t => {
                        if (t !== this && !t.dead && Math.sqrt((t.x - worldOx) ** 2 + (t.y - worldOy) ** 2) < t.radius + 8) {
                            t.takeDamage(5, this);
                        }
                    });
                }
            }
        }

        ctx.rotate(this.angle);

        // Body
        const size = this.radius * this.sizeMult;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cannon
        ctx.fillStyle = '#333';
        ctx.fillRect(0, -5 * this.sizeMult, (size + 10), 10 * this.sizeMult);

        ctx.restore();

        // Name & HP
        if (this.isPlayer || dist(this, player) < width / 2) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.name} [${this.level}]`, this.x, this.y - (this.radius * this.sizeMult) - 10);

            // HP Bar
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - 20, this.y - (this.radius * this.sizeMult) - 5, 40, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x - 20, this.y - (this.radius * this.sizeMult) - 5, 40 * (this.hp / this.maxHp), 4);
        }
    }
}

class Bullet extends Entity {
    constructor(x, y, angle, owner) {
        super(x, y, 5 * (owner.sizeMult || 1), owner.color);
        this.owner = owner;
        this.speed = 15;
        this.vel = {
            x: Math.cos(angle) * this.speed,
            y: Math.sin(angle) * this.speed
        };
        this.life = 60;
        this.homing = owner.homing || 0;
        this.bounce = owner.bounce || 0;
        this.damage = owner.damage;
    }

    update() {
        // Homing Logic
        if (this.homing > 0 && this.owner.isPlayer) {
            let closest = null;
            let minDist = 300;
            ships.forEach(s => {
                if (s !== this.owner && !s.dead) {
                    const d = dist(this, s);
                    if (d < minDist) {
                        minDist = d;
                        closest = s;
                    }
                }
            });

            if (closest) {
                const angleToTarget = Math.atan2(closest.y - this.y, closest.x - this.x);
                const currentAngle = Math.atan2(this.vel.y, this.vel.x);
                // Simple steering
                const newAngle = currentAngle + (angleToTarget - currentAngle) * (0.1 * this.homing);
                const speed = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2);
                this.vel.x = Math.cos(newAngle) * speed;
                this.vel.y = Math.sin(newAngle) * speed;
            }
        }

        this.x += this.vel.x;
        this.y += this.vel.y;
        this.life--;

        // Bounce Logic
        let bounced = false;
        if (this.x < 0 || this.x > WORLD_SIZE) {
            if (this.bounce > 0) { this.vel.x *= -1; this.bounce--; bounced = true; }
            else this.dead = true;
        }
        if (this.y < 0 || this.y > WORLD_SIZE) {
            if (this.bounce > 0) { this.vel.y *= -1; this.bounce--; bounced = true; }
            else this.dead = true;
        }

        if (bounced) {
            this.x = Math.max(0, Math.min(this.x, WORLD_SIZE));
            this.y = Math.max(0, Math.min(this.y, WORLD_SIZE));
        }

        if (this.life <= 0) this.dead = true;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Orb extends Entity {
    constructor(x, y, val) {
        super(x, y, 5 + Math.min(val / 10, 10), '#ffff00');
        this.val = val;
        this.floatOffset = rand(0, Math.PI * 2);
    }

    update() {
        this.floatOffset += 0.1;
        // Magnet to player
        const d = dist(this, player);
        const magnetRange = 150 + (player.sizeMult * 50); // Bigger players have bigger magnet

        if (d < magnetRange) {
            this.x += (player.x - this.x) * 0.15;
            this.y += (player.y - this.y) * 0.15;
        }

        if (d < player.radius * player.sizeMult + this.radius) {
            this.dead = true;
            player.xp += this.val;
            player.score += this.val;
            playSound('xp');
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y + Math.sin(this.floatOffset) * 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${Date.now() % 360}, 100%, 50%)`;
        ctx.fill();
    }
}

class Asteroid extends Entity {
    constructor(x, y, size) {
        super(x, y, size * 15, '#555');
        this.size = size;
        this.hp = size * 20;
        this.angle = rand(0, Math.PI * 2);
        this.poly = [];
        const pts = 8;
        for (let i = 0; i < pts; i++) {
            const a = (i / pts) * Math.PI * 2;
            const r = this.radius * rand(0.8, 1.2);
            this.poly.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
    }

    update() {
        // Static mostly
    }

    takeDamage(amt) {
        this.hp -= amt;
        if (this.hp <= 0) {
            this.dead = true;
            // Drop XP
            for (let i = 0; i < this.size * 2; i++) {
                orbs.push(new Orb(this.x + rand(-20, 20), this.y + rand(-20, 20), 10));
            }
            // Respawn handled globally
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(this.poly[0].x, this.poly[0].y);
        for (let i = 1; i < this.poly.length; i++) ctx.lineTo(this.poly[i].x, this.poly[i].y);
        ctx.closePath();
        ctx.fillStyle = '#444';
        ctx.fill();
        ctx.strokeStyle = '#666';
        ctx.stroke();
        ctx.restore();
    }
}

// Globals
let player;
let ships = [];
let bullets = [];
let orbs = [];
let asteroids = [];

// Input
const keys = {};
const mouse = { x: 0, y: 0 };
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mousedown', () => {
    if (gameState === 'PLAYING' && player.cooldown <= 0) player.shoot();
});

function spawnBot() {
    // Spawn far from player
    let x, y, d;
    do {
        x = rand(0, WORLD_SIZE);
        y = rand(0, WORLD_SIZE);
        d = dist({ x, y }, player);
    } while (d < 1000); // Don't spawn too close

    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const bot = new Ship(x, y, name);

    // Scale bot with game time
    const difficulty = 1 + (gameTime / 3600); // Increases every minute
    bot.level = Math.floor(rand(1, difficulty * 5));
    bot.maxHp *= difficulty;
    bot.hp = bot.maxHp;
    bot.damage *= difficulty;

    ships.push(bot);
}

function startGame() {
    const nameInput = document.getElementById('playerName').value || "Player";
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';

    player = new Ship(WORLD_SIZE / 2, WORLD_SIZE / 2, nameInput, true);
    ships.push(player);

    // Spawn Initial Bots (Weak)
    for (let i = 0; i < 10; i++) spawnBot();

    // Spawn Asteroids
    for (let i = 0; i < 50; i++) {
        asteroids.push(new Asteroid(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE), Math.floor(rand(1, 4))));
    }

    gameState = 'PLAYING';
    gameLoop();
}

function gameLoop() {
    if (gameState === 'DEAD') return;
    requestAnimationFrame(gameLoop);

    if (gameState === 'LEVEL_UP') return;

    gameTime++;

    // Spawn Logic
    if (ships.length < 20 + (gameTime / 600)) { // Cap increases over time
        if (Math.random() < 0.05) spawnBot();
    }
    if (asteroids.length < 50) {
        if (Math.random() < 0.02) asteroids.push(new Asteroid(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE), Math.floor(rand(1, 4))));
    }

    // Update Camera
    camera.x = player.x - width / 2;
    camera.y = player.y - height / 2;
    // Clamp camera
    camera.x = Math.max(0, Math.min(camera.x, WORLD_SIZE - width));
    camera.y = Math.max(0, Math.min(camera.y, WORLD_SIZE - height));

    // Update Player Input
    if (gameState === 'PLAYING') {
        // Mouse Aim
        const dx = (mouse.x + camera.x) - player.x;
        const dy = (mouse.y + camera.y) - player.y;
        player.angle = Math.atan2(dy, dx);

        // Movement
        const moveSpeed = player.speed;
        if (keys['KeyW'] || keys['ArrowUp']) player.acc.y = -0.5;
        if (keys['KeyS'] || keys['ArrowDown']) player.acc.y = 0.5;
        if (keys['KeyA'] || keys['ArrowLeft']) player.acc.x = -0.5;
        if (keys['KeyD'] || keys['ArrowRight']) player.acc.x = 0.5;
    }

    // Update Entities
    [...ships, ...bullets, ...orbs, ...asteroids].forEach(e => e.update());

    // Collisions
    // Bullet vs Ship/Asteroid
    bullets.forEach(b => {
        if (b.dead) return;

        // Vs Ships
        ships.forEach(s => {
            if (s !== b.owner && !s.dead && dist(b, s) < (s.radius * (s.sizeMult || 1)) + b.radius) {
                if (b.bounce <= 0) b.dead = true;
                else {
                    // Bounce off ship
                    b.vel.x *= -1; b.vel.y *= -1; b.bounce--;
                }
                s.takeDamage(b.damage, b.owner);
            }
        });

        // Vs Asteroids
        asteroids.forEach(a => {
            if (!a.dead && dist(b, a) < a.radius + b.radius) {
                if (b.bounce <= 0) b.dead = true;
                else {
                    b.vel.x *= -1; b.vel.y *= -1; b.bounce--;
                }
                a.takeDamage(b.damage);
            }
        });
    });

    // Cleanup
    ships = ships.filter(e => !e.dead);
    bullets = bullets.filter(e => !e.dead);
    orbs = orbs.filter(e => !e.dead);
    asteroids = asteroids.filter(e => !e.dead);

    // Draw
    draw();
    updateUI();
}

function draw() {
    // Background Grid
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Grid Lines
    ctx.strokeStyle = '#1a1b26';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= WORLD_SIZE; x += 100) { ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_SIZE); }
    for (let y = 0; y <= WORLD_SIZE; y += 100) { ctx.moveTo(0, y); ctx.lineTo(WORLD_SIZE, y); }
    ctx.stroke();

    // World Border
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    // Draw Entities
    orbs.forEach(e => e.draw(ctx));
    asteroids.forEach(e => e.draw(ctx));
    bullets.forEach(e => e.draw(ctx));
    ships.forEach(e => e.draw(ctx));

    ctx.restore();

    // Minimap
    drawMinimap();
}

function drawMinimap() {
    minimapCtx.fillStyle = '#000';
    minimapCtx.fillRect(0, 0, 150, 150);

    const scale = 150 / WORLD_SIZE;

    ships.forEach(s => {
        minimapCtx.fillStyle = s.isPlayer ? '#00f2ff' : '#ff0055';
        minimapCtx.beginPath();
        minimapCtx.arc(s.x * scale, s.y * scale, s.isPlayer ? 3 : 2, 0, Math.PI * 2);
        minimapCtx.fill();
    });

    // Viewport rect
    minimapCtx.strokeStyle = 'white';
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(camera.x * scale, camera.y * scale, width * scale, height * scale);
}

function updateUI() {
    document.getElementById('scoreVal').innerText = Math.floor(player.score);
    document.getElementById('killsVal').innerText = player.kills;
    document.getElementById('level-badge').innerText = player.level;

    const xpNeed = Math.floor(100 * Math.pow(1.2, player.level - 1));
    const xpPct = (player.xp / xpNeed) * 100;
    document.getElementById('xp-bar-fill').style.width = `${xpPct}%`;

    // Leaderboard
    const sorted = [...ships].sort((a, b) => b.score - a.score).slice(0, 5);
    const lbHtml = sorted.map((s, i) => `
        <div class="lb-row ${s.isPlayer ? 'me' : ''}">
            <span>${i + 1}. ${s.name}</span>
            <span>${Math.floor(s.score)}</span>
        </div>
    `).join('');
    document.getElementById('lb-list').innerHTML = lbHtml;
}

// Upgrades - Vampire Survivors Style
const UPGRADES = [
    { id: 'multi', title: 'Multishot', desc: '+1 Projectile', icon: '🔱', rarity: 'RARE', apply: (s) => s.projectileCount++ },
    { id: 'speed', title: 'Turbo Engine', desc: '+15% Speed', icon: '🚀', rarity: 'COMMON', apply: (s) => s.speed *= 1.15 },
    { id: 'damage', title: 'Plasma Rounds', desc: '+20% Damage', icon: '💥', rarity: 'COMMON', apply: (s) => s.damage *= 1.2 },
    { id: 'rate', title: 'Rapid Fire', desc: '-10% Cooldown', icon: '⚡', rarity: 'COMMON', apply: (s) => s.fireRate *= 0.9 },
    { id: 'health', title: 'Hull Reinforcement', desc: '+50 Max HP & Heal', icon: '🛡️', rarity: 'COMMON', apply: (s) => { s.maxHp += 50; s.hp = s.maxHp; } },
    { id: 'homing', title: 'Smart Bullets', desc: 'Bullets seek enemies', icon: '🧠', rarity: 'EPIC', apply: (s) => s.homing += 0.5 },
    { id: 'bounce', title: 'Ricochet', desc: 'Bullets bounce off walls', icon: '🏀', rarity: 'RARE', apply: (s) => s.bounce++ },
    { id: 'aura', title: 'Static Field', desc: 'Damage aura around ship', icon: '⚡', rarity: 'EPIC', apply: (s) => { s.auraRadius += 50; s.auraDamage += 0.5; } },
    { id: 'orbital', title: 'Guardian Drone', desc: 'Orbital projectile', icon: '🛰️', rarity: 'LEGENDARY', apply: (s) => s.orbitals++ },
    { id: 'giant', title: 'Gigantism', desc: '+20% Size & HP', icon: '🦍', rarity: 'RARE', apply: (s) => { s.sizeMult *= 1.2; s.maxHp *= 1.2; s.hp += 20; } },
    { id: 'sniper', title: 'Sniper Module', desc: 'Less spread, faster bullets', icon: '🎯', rarity: 'RARE', apply: (s) => { s.spread *= 0.5; s.damage *= 1.2; } },
    { id: 'shotgun', title: 'Scatter Module', desc: 'More spread, more bullets', icon: '🎉', rarity: 'RARE', apply: (s) => { s.spread += 0.2; s.projectileCount += 2; } }
];

function showUpgradeModal() {
    const modal = document.getElementById('upgrade-modal');
    const container = document.getElementById('upgrade-cards');
    container.innerHTML = '';

    // Pick 3 random
    const opts = [];
    for (let i = 0; i < 3; i++) opts.push(UPGRADES[Math.floor(Math.random() * UPGRADES.length)]);

    opts.forEach(u => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';

        let color = '#fff';
        if (u.rarity === 'RARE') color = '#00f2ff';
        if (u.rarity === 'EPIC') color = '#bd00ff';
        if (u.rarity === 'LEGENDARY') color = '#ffcc00';

        card.style.borderColor = color;
        card.innerHTML = `
            <div class="card-rarity" style="color: ${color}; border: 1px solid ${color};">${u.rarity}</div>
            <div class="card-icon">${u.icon}</div>
            <div class="card-title" style="color: ${color};">${u.title}</div>
            <div class="card-desc">${u.desc}</div>
        `;
        card.onclick = () => selectUpgrade(u);
        container.appendChild(card);
    });

    modal.style.display = 'flex';
}

function selectUpgrade(u) {
    u.apply(player);
    document.getElementById('upgrade-modal').style.display = 'none';
    gameState = 'PLAYING';
    gameLoop();
}
