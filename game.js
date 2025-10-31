// =========================
// Math Catcher — game.js
// =========================

const LEVELS = [
  { id: 1, time: 30, equations: ['1+1=2', '2+2=4', '3+1=4'], wrong: ['1+2=5', '4+3=2'], target: 10 },
  { id: 2, time: 30, equations: ['5-2=3', '6-3=3', '7-2=5'], wrong: ['3-2=4', '9-1=3'], target: 15 },
  { id: 3, time: 30, equations: ['4+5=9', '6+2=8', '7-3=4'], wrong: ['8+1=10', '2+6=5'], target: 20 },
  { id: 4, time: 40, equations: ['10-3=7', '8+2=10', '9-4=5'], wrong: ['6-1=8', '3+7=11'], target: 25 },
  { id: 5, time: 40, equations: ['12-5=7', '9+3=12', '15-6=9'], wrong: ['8-3=2', '5+5=11'], target: 30 }
];

let currentLevel = 1;
let score = 0;
let timeLeft = 0;
let running = false;
let interval;
let canvas, ctx, paddle, cssWidth, cssHeight;
let fallingItems = [];

// =========================
// Game Logic
// =========================

function initGame(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  score = 0;
  timeLeft = level.time;
  running = true;
  fallingItems = [];

  document.getElementById('score').textContent = score;
  document.getElementById('timeLeft').textContent = timeLeft;
  document.getElementById('levelLabel').textContent = `Level ${levelId}`;

  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  const container = document.getElementById('gameContainer');
  const rect = container.getBoundingClientRect();
  cssWidth = rect.width;
  cssHeight = rect.height;
  canvas.width = cssWidth;
  canvas.height = cssHeight;

  paddle = { width: 100, height: 20, x: cssWidth / 2 - 50, y: cssHeight - 40, color: '#ffffff' };

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    paddle.x = x - paddle.width / 2;
  });

  interval = setInterval(() => {
    timeLeft--;
    document.getElementById('timeLeft').textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);

  requestAnimationFrame(loop);
}

function spawnEquation() {
  const level = LEVELS.find(l => l.id === currentLevel);
  const isCorrect = Math.random() < 0.6;
  const text = isCorrect ? randomChoice(level.equations) : randomChoice(level.wrong);
  fallingItems.push({
    text,
    correct: isCorrect,
    x: Math.random() * (cssWidth - 80) + 40,
    y: -20,
    vy: 1 + Math.random() * 1.5, // เดิมคือ 2 + Math.random() * 2
  });
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function loop() {
  if (!running) return;
  if (Math.random() < 0.03) spawnEquation();

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Draw paddle
  ctx.fillStyle = paddle.color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Draw equations
  ctx.font = '20px Chalkboard, sans-serif';
  ctx.fillStyle = '#ffffff';
  for (let i = fallingItems.length - 1; i >= 0; i--) {
    const f = fallingItems[i];
    f.y += f.vy;
    ctx.fillText(f.text, f.x, f.y);

    if (f.y + 20 >= paddle.y && f.x >= paddle.x && f.x <= paddle.x + paddle.width) {
      score += f.correct ? 1 : -1;
      document.getElementById('score').textContent = score;
      fallingItems.splice(i, 1);
    } else if (f.y > cssHeight + 30) {
      fallingItems.splice(i, 1);
    }
  }

  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  clearInterval(interval);
  const level = LEVELS.find(l => l.id === currentLevel);
  const result = score >= level.target;

  alert(result ? `✅ Level ${currentLevel} passed!` : `❌ Level ${currentLevel} failed!`);
  if (result) {
    saveProgress(currentLevel);
    if (currentLevel < LEVELS.length) {
      currentLevel++;
      initGame(currentLevel);
    } else {
      alert('🎉 You completed all levels!');
      showScreen('mainMenu');
    }
  } else {
    showScreen('mainMenu');
  }
}

function saveProgress(levelId) {
  const data = JSON.parse(localStorage.getItem('mathCatcher_v1') || '{}');
  data[`level${levelId}`] = { passed: true, highScore: Math.max(score, data[`level${levelId}`]?.highScore || 0) };
  localStorage.setItem('mathCatcher_v1', JSON.stringify(data));
}

// =========================
// UI Navigation
// =========================

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  // Main menu buttons
  document.getElementById('btnPlay').onclick = () => showScreen('categoryMenu');
  document.getElementById('btnHelp').onclick = () => showScreen('helpMenu');
  document.getElementById('btnContact').onclick = () => showScreen('contactMenu');

  // Category button (Math)
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.onclick = () => {
      const cat = btn.dataset.cat;
      if (cat === 'math') showLevelMenu();
    };
  });

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.onclick = () => showScreen('mainMenu');
  });
});

// =========================
// Level Menu
// =========================

function showLevelMenu() {
  const grid = document.getElementById('levelsGrid');
  grid.innerHTML = '';
  const progress = JSON.parse(localStorage.getItem('mathCatcher_v1') || '{}');

  LEVELS.forEach(level => {
    const btn = document.createElement('button');
    btn.textContent = `Level ${level.id}`;
    if (progress[`level${level.id}`]?.passed) btn.classList.add('passed');
    btn.onclick = () => {
      currentLevel = level.id;
      showScreen('gameScreen');
      initGame(currentLevel);
    };
    grid.appendChild(btn);
  });

  showScreen('levelMenu');
}
