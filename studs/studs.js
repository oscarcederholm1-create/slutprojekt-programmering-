const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Bollens egenskaper
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = 2; 
let dy = 3; 
const radius = 10;

let projectiles = [];
const projectileRadius = 3;
const projectileSpeed = 4;
const projectileLife = 120;
const homingStrength = 0.08;

let x2 = 50;
let y2 = 50;
let dx2 = 0;
let dy2 = 0;
const ball2Speed = 4;
let keys = { w: false, a: false, s: false, d: false };
let shotTimer = 0;
const shotInterval = 60;

let running = true;

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();
}

function drawBall2() {
  ctx.beginPath();
  ctx.arc(x2, y2, radius, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();
}

function createProjectile(startX, startY, dirX, dirY) {
  const length = Math.sqrt(dirX * dirX + dirY * dirY);
  const normalizedDx = length === 0 ? projectileSpeed : (dirX / length) * projectileSpeed;
  const normalizedDy = length === 0 ? 0 : (dirY / length) * projectileSpeed;
  
  return {
    x: startX,
    y: startY,
    dx: normalizedDx,
    dy: normalizedDy,
    life: projectileLife,
    active: true
  };
}

function draw() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    if (proj.active) {
      proj.life--;
      const targetDx = x2 - proj.x;
      const targetDy = y2 - proj.y;
      const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
      if (targetDist > 0) {
        proj.dx += (targetDx / targetDist) * homingStrength;
        proj.dy += (targetDy / targetDist) * homingStrength;
        const currentLen = Math.sqrt(proj.dx * proj.dx + proj.dy * proj.dy);
        proj.dx = (proj.dx / currentLen) * projectileSpeed;
        proj.dy = (proj.dy / currentLen) * projectileSpeed;
      }
      proj.x += proj.dx;
      proj.y += proj.dy;
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
      }
    }
    if (!proj.active) {
      projectiles.splice(i, 1);
    }
  }

  dx2 = 0;
  dy2 = 0;
  if (keys.w) dy2 = -ball2Speed;
  if (keys.a) dx2 = -ball2Speed;
  if (keys.s) dy2 = ball2Speed;
  if (keys.d) dx2 = ball2Speed;
  x2 += dx2;
  y2 += dy2;
  if (x2 + dx2 > canvas.width - radius || x2 + dx2 < radius) {
    dx2 = -dx2;
  }
  if (y2 + dy2 > canvas.height - radius || y2 + dy2 < radius) {
    dy2 = -dy2;
  }
  drawBall2();

  drawBall();

  if (x + dx > canvas.width - radius || x + dx < radius) {
    dx = -dx;
  }
  if (y + dy > canvas.height - radius || y + dy < radius) {
    dy = -dy;
  }

  x += dx;
  y += dy;

  shotTimer++;
  if (shotTimer >= shotInterval) {
    projectiles.push(createProjectile(x, y, x2 - x, y2 - y));
    shotTimer = 0;
  }

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

// Start-knappen
document.getElementById("startBtn").addEventListener("click", () => {
  if (!running) {
    running = true;
    animationId = requestAnimationFrame(draw);
  }
  
});
// Stop-knapp
document.getElementById("stopBtn").addEventListener("click", () => {
  running = false;
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    projectiles.push(createProjectile(x, y, dx, dy));
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
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