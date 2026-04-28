const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const radius = 10;
const projectileRadius = 3;
const enemyProjectileSpeed = 4;
const playerProjectileSpeed = 5;
const projectileLife = 120;
const homingStrength = 0.08;
const shotInterval = 60;
const maxHealth = 5;
const maxEnemyHealth = 3;
const enemyBallSpeed = 2.5;
const playerBallSpeed = 4;

let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = 2;
let dy = 3;

let x2 = 50;
let y2 = 50;
let dx2 = 0;
let dy2 = 0;
let keys = { w: false, a: false, s: false, d: false };
let shotTimer = 0;

let playerHealth = maxHealth;
let enemyHealth = maxEnemyHealth;
let score = 0;
let running = true;
let animationId = null;
let enemyAlive = true;

const enemyProjectiles = [];
const playerProjectiles = [];

const scoreValue = document.getElementById("scoreValue");
const healthFill = document.getElementById("healthFill");
const healthText = document.getElementById("healthText");

function drawEnemy() {
  if (!enemyAlive) return;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(x2, y2, radius, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();
}

function updateHud() {
  scoreValue.textContent = score;
  const healthPercent = Math.max(0, playerHealth) / maxHealth;
  healthFill.style.width = `${healthPercent * 100}%`;
  healthFill.style.background = playerHealth > 2 ? "#0f0" : playerHealth > 1 ? "#ff0" : "#f00";
  healthText.textContent = `Health: ${playerHealth} / ${maxHealth}`;
}

function getRandomPosition(min, max) {
  return Math.random() * (max - min) + min;
}

function respawnEnemy() {
  enemyAlive = true;
  enemyHealth = maxEnemyHealth;

  const margin = radius * 3;
  let newX;
  let newY;
  let safeDistance = false;

  while (!safeDistance) {
    newX = getRandomPosition(margin, canvas.width - margin);
    newY = getRandomPosition(margin, canvas.height - margin);
    const dxPlayer = newX - x2;
    const dyPlayer = newY - y2;
    safeDistance = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer) > 100;
  }

  x = newX;
  y = newY;
  dx = Math.sign(Math.random() - 0.5) * enemyBallSpeed;
  dy = Math.sign(Math.random() - 0.5) * enemyBallSpeed;
}

function createProjectile(startX, startY, dirX, dirY, type = "enemy") {
  const speed = type === "player" ? playerProjectileSpeed : enemyProjectileSpeed;
  const length = Math.sqrt(dirX * dirX + dirY * dirY);
  const normalizedDx = length === 0 ? speed : (dirX / length) * speed;
  const normalizedDy = length === 0 ? 0 : (dirY / length) * speed;

  return {
    x: startX,
    y: startY,
    dx: normalizedDx,
    dy: normalizedDy,
    life: projectileLife,
    active: true,
    type,
    bounces: 0,
    maxBounces: type === "player" ? 1 : 0
  };
}

function collides(ax, ay, ar, bx, by, br) {
  const distance = Math.hypot(ax - bx, ay - by);
  return distance <= ar + br;
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "18px sans-serif";
  ctx.fillText(`Final score: ${score}`, canvas.width / 2, canvas.height / 2 + 24);
}

function resetGame() {
  playerHealth = maxHealth;
  score = 0;
  enemyHealth = maxEnemyHealth;
  enemyAlive = true;
  running = true;
  shotTimer = 0;
  enemyProjectiles.length = 0;
  playerProjectiles.length = 0;
  x2 = 50;
  y2 = 50;
  respawnEnemy();
  updateHud();
  animationId = requestAnimationFrame(draw);
}

function draw() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const proj = enemyProjectiles[i];
    if (!proj.active) {
      enemyProjectiles.splice(i, 1);
      continue;
    }

    proj.life--;
    const targetDx = x2 - proj.x;
    const targetDy = y2 - proj.y;
    const targetDist = Math.hypot(targetDx, targetDy);
    if (targetDist > 0) {
      proj.dx += (targetDx / targetDist) * homingStrength;
      proj.dy += (targetDy / targetDist) * homingStrength;
      const currentLen = Math.hypot(proj.dx, proj.dy);
      proj.dx = (proj.dx / currentLen) * enemyProjectileSpeed;
      proj.dy = (proj.dy / currentLen) * enemyProjectileSpeed;
    }

    proj.x += proj.dx;
    proj.y += proj.dy;

    if (collides(proj.x, proj.y, projectileRadius, x2, y2, radius)) {
      playerHealth = Math.max(0, playerHealth - 1);
      proj.active = false;
      updateHud();
      if (playerHealth <= 0) {
        running = false;
        drawGameOver();
        return;
      }
    }

    if (proj.life <= 0 || proj.x - projectileRadius < 0 || proj.x + projectileRadius > canvas.width ||
        proj.y - projectileRadius < 0 || proj.y + projectileRadius > canvas.height) {
      proj.active = false;
    }

    if (proj.active) {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, projectileRadius, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
    } else {
      enemyProjectiles.splice(i, 1);
    }
  }

  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    const proj = playerProjectiles[i];
    if (!proj.active) {
      playerProjectiles.splice(i, 1);
      continue;
    }

    proj.life--;
    proj.x += proj.dx;
    proj.y += proj.dy;

    if (proj.type === "player") {
      if (proj.x - projectileRadius < 0 || proj.x + projectileRadius > canvas.width) {
        proj.dx = -proj.dx;
        proj.bounces++;
        proj.x = Math.max(projectileRadius, Math.min(canvas.width - projectileRadius, proj.x));
      }
      if (proj.y - projectileRadius < 0 || proj.y + projectileRadius > canvas.height) {
        proj.dy = -proj.dy;
        proj.bounces++;
        proj.y = Math.max(projectileRadius, Math.min(canvas.height - projectileRadius, proj.y));
      }
      if (proj.bounces >= proj.maxBounces) {
        proj.active = false;
      }
    }

    if (enemyAlive && collides(proj.x, proj.y, projectileRadius, x, y, radius)) {
      enemyHealth = Math.max(0, enemyHealth - 1);
      proj.active = false;

      if (enemyHealth <= 0) {
        score += 1;
        enemyAlive = false;
        respawnEnemy();
      }

      updateHud();
    }

    if (proj.life <= 0 || proj.x - projectileRadius < 0 || proj.x + projectileRadius > canvas.width ||
        proj.y - projectileRadius < 0 || proj.y + projectileRadius > canvas.height) {
      proj.active = false;
    }

    if (proj.active) {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, projectileRadius, 0, Math.PI * 2);
      ctx.fillStyle = "cyan";
      ctx.fill();
      ctx.closePath();
    } else {
      playerProjectiles.splice(i, 1);
    }
  }

  dx2 = 0;
  dy2 = 0;
  if (keys.w) dy2 = -playerBallSpeed;
  if (keys.a) dx2 = -playerBallSpeed;
  if (keys.s) dy2 = playerBallSpeed;
  if (keys.d) dx2 = playerBallSpeed;

  x2 += dx2;
  y2 += dy2;
  x2 = Math.max(radius, Math.min(canvas.width - radius, x2));
  y2 = Math.max(radius, Math.min(canvas.height - radius, y2));

  drawPlayer();
  drawEnemy();

  if (enemyAlive) {
    if (x + dx > canvas.width - radius || x + dx < radius) dx = -dx;
    if (y + dy > canvas.height - radius || y + dy < radius) dy = -dy;
    x += dx;
    y += dy;

    shotTimer++;
    if (shotTimer >= shotInterval) {
      enemyProjectiles.push(createProjectile(x, y, x2 - x, y2 - y));
      shotTimer = 0;
    }
  }

  requestAnimationFrame(draw);
}

updateHud();
animationId = requestAnimationFrame(draw);

document.getElementById("startBtn").addEventListener("click", () => {
  if (!running && playerHealth > 0) {
    running = true;
    animationId = requestAnimationFrame(draw);
  }
});

document.getElementById("stopBtn").addEventListener("click", () => {
  running = false;
});

document.getElementById("restartBtn").addEventListener("click", () => {
  resetGame();
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (event.code === "Space" && playerHealth > 0) {
    playerProjectiles.push(createProjectile(x2, y2, x - x2, y - y2, "player"));
    return;
  }

  if (key === "w") keys.w = true;
  else if (key === "a") keys.a = true;
  else if (key === "s") keys.s = true;
  else if (key === "d") keys.d = true;
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key === "w") keys.w = false;
  else if (key === "a") keys.a = false;
  else if (key === "s") keys.s = false;
  else if (key === "d") keys.d = false;
});