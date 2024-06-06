const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    angle: 0,
    rotation: 0,
    thrusting: false,
    thrust: { x: 0, y: 0 },
    bullets: [],
    lives: 3,
    score: 0
};

let asteroids = [];
const bullets = [];
const bulletSpeed = 5;
const bulletLifetime = 60; // Frames
let asteroidCount = 5;
const asteroidMinSize = 20;
const asteroidMaxSize = 50;
let gameOver = false;

function createAsteroid(x, y, radius) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    return {
        x: x,
        y: y,
        radius: radius,
        xSpeed: Math.cos(angle) * speed,
        ySpeed: Math.sin(angle) * speed
    };
}

function splitAsteroid(asteroid) {
    const newAsteroids = [];
    const newSize = asteroid.radius / 2;
    if (newSize >= asteroidMinSize) {
        newAsteroids.push(createAsteroid(asteroid.x, asteroid.y, newSize));
        newAsteroids.push(createAsteroid(asteroid.x, asteroid.y, newSize));
    }
    return newAsteroids;
}

function resetShip() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.angle = 0;
    ship.thrust = { x: 0, y: 0 };
}

function resetGame() {
    ship.lives = 3;
    ship.score = 0;
    asteroidCount = 5;
    asteroids = [];
    createInitialAsteroids();
    resetShip();
    gameOver = false;
    document.location.reload(); // Reloads the page to reset the game
}

function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.beginPath();
    ctx.moveTo(0, -ship.radius);
    ctx.lineTo(ship.radius, ship.radius);
    ctx.lineTo(-ship.radius, ship.radius);
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
}

function drawAsteroid(asteroid) {
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

function drawBullet(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
}

function drawText(text, x, y, size = 20, align = 'center') {
    ctx.font = `${size}px Arial`;
    ctx.textAlign = align;
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}

function updateShip() {
    if (ship.thrusting) {
        ship.thrust.x += Math.cos(ship.angle - Math.PI / 2) * 0.1;
        ship.thrust.y += Math.sin(ship.angle - Math.PI / 2) * 0.1;
    } else {
        ship.thrust.x *= 0.99;
        ship.thrust.y *= 0.99;
    }

    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    if (ship.x < 0 - ship.radius) ship.x = canvas.width + ship.radius;
    if (ship.x > canvas.width + ship.radius) ship.x = 0 - ship.radius;
    if (ship.y < 0 - ship.radius) ship.y = canvas.height + ship.radius;
    if (ship.y > canvas.height + ship.radius) ship.y = 0 - ship.radius;

    ship.angle += ship.rotation;
}

function updateAsteroids() {
    for (const asteroid of asteroids) {
        asteroid.x += asteroid.xSpeed;
        asteroid.y += asteroid.ySpeed;

        if (asteroid.x < 0 - asteroid.radius) asteroid.x = canvas.width + asteroid.radius;
        if (asteroid.x > canvas.width + asteroid.radius) asteroid.x = 0 - asteroid.radius;
        if (asteroid.y < 0 - asteroid.radius) asteroid.y = canvas.height + asteroid.radius;
        if (asteroid.y > canvas.height + asteroid.radius) asteroid.y = 0 - asteroid.radius;
    }
}

function updateBullets() {
    for (let i = ship.bullets.length - 1; i >= 0; i--) {
        const bullet = ship.bullets[i];
        bullet.x += bullet.xSpeed;
        bullet.y += bullet.ySpeed;
        bullet.life--;

        if (bullet.life <= 0) {
            ship.bullets.splice(i, 1);
        }
    }
}

function detectCollisions() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        // Ship collision
        const dx = asteroid.x - ship.x;
        const dy = asteroid.y - ship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < asteroid.radius + ship.radius) {
            ship.lives--;
            resetShip();
            if (ship.lives <= 0) {
                gameOver = true;
                alert(`Game Over! Your score: ${ship.score}`);
                return;
            }
        }

        // Bullet collisions
        for (let j = ship.bullets.length - 1; j >= 0; j--) {
            const bullet = ship.bullets[j];
            const bdx = asteroid.x - bullet.x;
            const bdy = asteroid.y - bullet.y;
            const bDistance = Math.sqrt(bdx * bdx + bdy * bdy);
            if (bDistance < asteroid.radius) {
                ship.score += 10;
                asteroids.splice(i, 1);
                ship.bullets.splice(j, 1);
                asteroids.push(...splitAsteroid(asteroid));
                break;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawShip();
    for (const asteroid of asteroids) {
        drawAsteroid(asteroid);
    }
    for (const bullet of ship.bullets) {
        drawBullet(bullet);
    }

    drawText(`Lives: ${ship.lives}`, canvas.width - 10, 30, 20, 'right');
    drawText(`Score: ${ship.score}`, 10, 30, 20, 'left');
}

function update() {
    if (!gameOver) {
        updateShip();
        updateAsteroids();
        updateBullets();
        detectCollisions();
        draw();

        if (asteroids.length === 0) {
            levelUp();
        }

        requestAnimationFrame(update);
    } else {
        resetGame();
    }
}

function levelUp() {
    asteroidCount++;
    for (let i = 0; i < asteroidCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * (asteroidMaxSize - asteroidMinSize) + asteroidMinSize;
        asteroids.push(createAsteroid(x, y, radius));
    }
}

function createInitialAsteroids() {
    for (let i = 0; i < asteroidCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * (asteroidMaxSize - asteroidMinSize) + asteroidMinSize;
        asteroids.push(createAsteroid(x, y, radius));
    }
}

createInitialAsteroids();

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            ship.thrusting = true;
            break;
        case 'ArrowLeft':
            ship.rotation = -0.05;
            break;
        case 'ArrowRight':
            ship.rotation = 0.05;
            break;
        case ' ':
            ship.bullets.push({
                x: ship.x + Math.cos(ship.angle - Math.PI / 2) * ship.radius,
                y: ship.y + Math.sin(ship.angle - Math.PI / 2) * ship.radius,
                xSpeed: Math.cos(ship.angle - Math.PI / 2) * bulletSpeed,
                ySpeed: Math.sin(ship.angle - Math.PI / 2) * bulletSpeed,
                life: bulletLifetime
            });
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            ship.thrusting = false;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            ship.rotation = 0;
            break;
    }
});

update();
