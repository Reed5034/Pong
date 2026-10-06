const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreLeftEl = document.getElementById('score-left');
const scoreRightEl = document.getElementById('score-right');

const game = {
  width: canvas.width,
  height: canvas.height,
  winningScore: 7,
  leftScore: 0,
  rightScore: 0,
  lastWinner: null,
};

const paddle = {
  width: 18,
  height: 120,
  speed: 7,
  left: {
    x: 28,
    y: canvas.height / 2 - 60,
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
  },
  right: {
    x: canvas.width - 46,
    y: canvas.height / 2 - 60,
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
  },
};

const ball = {
  radius: 10,
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 5,
  vy: 5,
  speed: 6,
};

const keys = {};

function randomDirection() {
  const direction = Math.random() < 0.5 ? -1 : 1;
  return direction * (Math.random() * 1.2 + 0.9);
}

function resetBall(lastScorer = null) {
  const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
  const direction = lastScorer === 'left' ? 1 : lastScorer === 'right' ? -1 : Math.random() < 0.5 ? 1 : -1;

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = Math.cos(angle) * ball.speed * direction;
  ball.vy = Math.sin(angle) * ball.speed;
}

function updateScore() {
  scoreLeftEl.textContent = String(game.leftScore);
  scoreRightEl.textContent = String(game.rightScore);
}

function checkWin() {
  if (game.leftScore >= game.winningScore || game.rightScore >= game.winningScore) {
    const winner = game.leftScore >= game.winningScore ? 'Player 1' : 'Player 2';
    alert(`${winner} wins the ping pong match! Press OK to restart.`);
    game.leftScore = 0;
    game.rightScore = 0;
    updateScore();
    resetBall();
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function movePaddle(paddleState, dx, dy) {
  const topLimit = 10;
  const bottomLimit = game.height - paddle.height - 10;

  if (paddleState === paddle.left) {
    const leftLimit = 20;
    const rightLimit = game.width / 2 - 120;
    paddleState.x = clamp(paddleState.x + dx * paddle.speed, leftLimit, rightLimit);
  } else {
    const leftLimit = game.width / 2 + 120;
    const rightLimit = game.width - paddle.width - 20;
    paddleState.x = clamp(paddleState.x + dx * paddle.speed, leftLimit, rightLimit);
  }

  paddleState.y = clamp(paddleState.y + dy * paddle.speed, topLimit, bottomLimit);
}

function handleInput() {
  const leftDX = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
  const leftDY = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
  const rightDX = (keys['ArrowRight'] ? 1 : 0) - (keys['ArrowLeft'] ? 1 : 0);
  const rightDY = (keys['ArrowDown'] ? 1 : 0) - (keys['ArrowUp'] ? 1 : 0);

  if (leftDX !== 0 || leftDY !== 0) {
    movePaddle(paddle.left, leftDX, leftDY);
  }

  if (rightDX !== 0 || rightDY !== 0) {
    movePaddle(paddle.right, rightDX, rightDY);
  }
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= game.height) {
    ball.vy *= -1;
    ball.y = Math.max(ball.radius, Math.min(game.height - ball.radius, ball.y));
  }

  const leftPaddle = paddle.left;
  const rightPaddle = paddle.right;

  const collidesWithLeft =
    ball.x - ball.radius <= leftPaddle.x + paddle.width &&
    ball.x + ball.radius >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + paddle.height &&
    ball.vx < 0;

  const collidesWithRight =
    ball.x + ball.radius >= rightPaddle.x &&
    ball.x - ball.radius <= rightPaddle.x + paddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + paddle.height &&
    ball.vx > 0;

  if (collidesWithLeft || collidesWithRight) {
    const targetY = (ball.y - (leftPaddle.y + paddle.height / 2)) / (paddle.height / 2);
    const angle = (targetY * Math.PI) / 3;
    const speedBoost = Math.min(1.2, 1 + (Math.abs(ball.vx) / 6) * 0.1);

    const direction = collidesWithLeft ? 1 : -1;
    ball.vx = Math.cos(angle) * ball.speed * speedBoost * direction;
    ball.vy = Math.sin(angle) * ball.speed * speedBoost;
    ball.x = collidesWithLeft
      ? leftPaddle.x + paddle.width + ball.radius + 1
      : rightPaddle.x - ball.radius - 1;
  }

  if (ball.x - ball.radius < 0) {
    game.rightScore += 1;
    updateScore();
    resetBall('right');
  }

  if (ball.x + ball.radius > game.width) {
    game.leftScore += 1;
    updateScore();
    resetBall('left');
  }

  checkWin();
}

function drawTableBackground() {
  ctx.fillStyle = '#0d6b43';
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, game.width - 20, game.height - 20);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(game.width, 10);
  ctx.moveTo(0, game.height - 10);
  ctx.lineTo(game.width, game.height - 10);
  ctx.stroke();
}

function drawNet() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(game.width / 2, 12);
  ctx.lineTo(game.width / 2, game.height - 12);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddles() {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(paddle.left.x, paddle.left.y, paddle.width, paddle.height);
  ctx.fillRect(paddle.right.x, paddle.right.y, paddle.width, paddle.height);
  ctx.shadowBlur = 0;
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#fefce8';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 10;
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawTableBackground();
  drawNet();
  drawPaddles();
  drawBall();
}

function gameLoop() {
  handleInput();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  if (event.key === ' ') {
    event.preventDefault();
    resetBall();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

updateScore();
resetBall();
gameLoop();
