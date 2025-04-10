const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvasElement.getContext("2d") as CanvasRenderingContext2D;
const scoreElement = document.getElementById("score") as HTMLDivElement;

const SIZE = 10;
const START_SPEED = 2;
const SPEED_INCREASE = 0.2;
const SENSIVITY = 20;

let blockVal = Math.floor(
  (window.innerHeight - window.innerHeight * 0.2) / SIZE
);
if (window.innerWidth < blockVal * SIZE + window.innerWidth * 0.1)
  blockVal = Math.floor((window.innerWidth - window.innerWidth * 0.1) / SIZE);
const BLOCK_SIZE = blockVal;

let startPos: Index | null = null;
let newPos: Index | null = null;

function isIndex(val: any): val is Index {
  return val?.x !== undefined && val?.y !== undefined;
}

function setTouch() {
  canvasElement.addEventListener("touchstart", (e) => {
    startPos = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };
  });

  canvasElement.addEventListener("touchmove", (e) => {
    newPos = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };
  });

  canvasElement.addEventListener("touchend", () => {
    const dir = checkSwipe();
    if (dir) direction = dir;
    startPos = null;
    newPos = null;
  });

  function checkSwipe(): Direction | null {
    if (!isIndex(newPos) || !isIndex(startPos)) {
      return null;
    }
    const absMove = Math.sqrt(
      Math.abs(newPos.x - startPos.x) ** 2 +
        Math.abs(newPos.y - startPos.y) ** 2
    );
    if (absMove < SENSIVITY) return null;
    if (Math.abs(newPos.x - startPos.x) > Math.abs(newPos.y - startPos.y)) {
      if (newPos.x - startPos.x > 0) {
        return "right";
      } else {
        return "left";
      }
    } else {
      if (newPos.y - startPos.y > 0) {
        return "down";
      } else {
        return "up";
      }
    }
  }
}

function setKeys() {
  document.addEventListener("keydown", (event) => {
    switch (event.key.toLowerCase()) {
      case "arrowup":
        direction = "up";
        break;
      case "arrowdown":
        direction = "down";
        break;
      case "arrowleft":
        direction = "left";
        break;
      case "arrowright":
        direction = "right";
        break;

      case "w":
        direction = "up";
        break;
      case "s":
        direction = "down";
        break;
      case "a":
        direction = "left";
        break;
      case "d":
        direction = "right";
        break;

      case "ц":
        direction = "up";
        break;
      case "ы":
        direction = "down";
        break;
      case "ф":
        direction = "left";
        break;
      case "в":
        direction = "right";
        break;
    }
  });
}

const BEST_SCORE = "best_score";

canvasElement.width = SIZE * BLOCK_SIZE;
canvasElement.height = SIZE * BLOCK_SIZE;

function timerDeco(f: (...args: any[]) => any): (...args: any[]) => any {
  return function (...args: any[]): Index {
    const start = performance.now();
    const res = f(...args);
    console.log(performance.now() - start);
    return res;
  };
}

function createFood(): Index {
  const free = [];
  for (let x = 0; x < canvasElement.width; x += BLOCK_SIZE) {
    for (let y = 0; y < canvasElement.height; y += BLOCK_SIZE) {
      if (
        snake.some((segment) => segment.x === x && segment.y === y) ||
        (x === food?.x && y === food?.y)
      ) {
        continue;
      }
      free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)];
}

function hasValue(val: string | null): val is string {
  return typeof val === "string";
}

enum Music {
  background,
  death,
  eat,
  puff
}
type Direction = "right" | "left" | "up" | "down";
type Index = { x: number; y: number };

function setInitValues() {
  const ss = Math.floor(SIZE / 2) * BLOCK_SIZE - BLOCK_SIZE;

  direction = "right";
  oldDirection = "right";

  score = 0;
  const storageRecord = localStorage.getItem(BEST_SCORE);
  record = hasValue(storageRecord) ? parseInt(storageRecord) : 0;
  speed = START_SPEED;

  snake = [
    {
      x: ss,
      y: ss,
    },
    {
      x: ss - BLOCK_SIZE,
      y: ss,
    },
    {
      x: ss - 2 * BLOCK_SIZE,
      y: ss,
    },
  ];
  food = createFood();
}

let snake: Index[];
let food: Index;
let score: number;
let record: number;
let direction: Direction;
let oldDirection: Direction;
let speed: number;

const altDirection = new Map<Direction, Direction>([
  ["right", "left"],
  ["left", "right"],
  ["up", "down"],
  ["down", "up"],
]);

const deathAudio = new Audio();
deathAudio.src = "audio/death.mp3";
const backgroundAudio = new Audio();
backgroundAudio.src = "audio/background.mp3";
backgroundAudio.loop = true;
const eatAudio = new Audio();
eatAudio.src = "audio/eat.mp3";
// const puffAudio = new Audio();
// puffAudio.src = "audio/puff.mp3";

deathAudio.volume = 1;
backgroundAudio.volume = 1;
eatAudio.volume = 0.4;
// puffAudio.volume = 1;

const cover = new Image();
cover.src = "img/cover.jpg";

function playBackground(bg: Music) {
  switch (bg) {
    case Music.background:
      if (!deathAudio.ended) {
        deathAudio.pause();
        deathAudio.currentTime = 0;
      }
      backgroundAudio.play();
      break;
    case Music.death:
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
      deathAudio.play();
      break;
    case Music.eat:
      if (!eatAudio.ended) {
        eatAudio.currentTime = 0;
      }
      eatAudio.play();
      break;
    case Music.puff:
      // puffAudio.play();
      break;
  }
}

function drawSnakeHead(x: number, y: number) {
  ctx.fillStyle = "darkgreen";
  ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

  const toothX = Math.floor(BLOCK_SIZE / 5);
  const toothW = Math.floor(BLOCK_SIZE / 6);
  const toothH = Math.floor(BLOCK_SIZE / 3);

  const mouthH = Math.floor(BLOCK_SIZE / 8);

  const eyeX = Math.floor(BLOCK_SIZE / 8);
  const eyeY = Math.floor(BLOCK_SIZE / 2);
  const eyeW = Math.floor(BLOCK_SIZE / 3);
  const eyeH = Math.floor(BLOCK_SIZE / 5);

  switch (direction) {
    case "right":
      ctx.fillStyle = "white";
      ctx.fillRect(x + BLOCK_SIZE, y + toothX, -toothH, toothW);
      ctx.fillRect(
        x + BLOCK_SIZE,
        y + BLOCK_SIZE - (toothX + toothW),
        -toothH,
        toothW
      );
      ctx.fillStyle = "red";
      ctx.fillRect(
        x + BLOCK_SIZE,
        y + toothX + toothW,
        -mouthH,
        BLOCK_SIZE - (toothX + toothW) * 2
      );
      ctx.fillStyle = "yellow";
      ctx.fillRect(x + BLOCK_SIZE - eyeY, y + eyeX, -eyeH, eyeW);
      ctx.fillRect(
        x + BLOCK_SIZE - eyeY,
        y + BLOCK_SIZE - (eyeX + eyeW),
        -eyeH,
        eyeW
      );
      break;
    case "left":
      ctx.fillStyle = "white";
      ctx.fillRect(x, y + toothX, toothH, toothW);
      ctx.fillRect(x, y + BLOCK_SIZE - (toothX + toothW), toothH, toothW);
      ctx.fillStyle = "red";
      ctx.fillRect(
        x,
        y + toothX + toothW,
        mouthH,
        BLOCK_SIZE - (toothX + toothW) * 2
      );
      ctx.fillStyle = "yellow";
      ctx.fillRect(x + eyeY, y + eyeX, eyeH, eyeW);
      ctx.fillRect(x + eyeY, y + BLOCK_SIZE - (eyeX + eyeW), eyeH, eyeW);
      break;
    case "up":
      ctx.fillStyle = "white";
      ctx.fillRect(x + toothX, y, toothW, toothH);
      ctx.fillRect(x + BLOCK_SIZE - (toothX + toothW), y, toothW, toothH);
      ctx.fillStyle = "red";
      ctx.fillRect(
        x + toothX + toothW,
        y,
        BLOCK_SIZE - (toothX + toothW) * 2,
        mouthH
      );
      ctx.fillStyle = "yellow";
      ctx.fillRect(x + eyeX, y + eyeY, eyeW, eyeH);
      ctx.fillRect(x + BLOCK_SIZE - (eyeX + eyeW), y + eyeY, eyeW, eyeH);
      break;
    case "down":
      ctx.fillStyle = "white";
      ctx.fillRect(x + toothX, y + BLOCK_SIZE, toothW, -toothH);
      ctx.fillRect(
        x + BLOCK_SIZE - (toothX + toothW),
        y + BLOCK_SIZE,
        toothW,
        -toothH
      );
      ctx.fillStyle = "red";
      ctx.fillRect(
        x + toothX + toothW,
        y + BLOCK_SIZE,
        BLOCK_SIZE - (toothX + toothW) * 2,
        -mouthH
      );
      ctx.fillStyle = "yellow";
      ctx.fillRect(x + eyeX, y + BLOCK_SIZE - eyeY, eyeW, -eyeH);
      ctx.fillRect(
        x + BLOCK_SIZE - (eyeX + eyeW),
        y + BLOCK_SIZE - eyeY,
        eyeW,
        -eyeH
      );
      break;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  snake.forEach((segment, index) => {
    if (index === 0) {
      drawSnakeHead(segment.x, segment.y);
      return;
    }
    ctx.fillStyle = index % 2 === 0 ? "darkgreen" : "green";
    ctx.fillRect(segment.x, segment.y, BLOCK_SIZE, BLOCK_SIZE);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, BLOCK_SIZE, BLOCK_SIZE);

  scoreElement.textContent = `score: ${score} | best: ${record} | speed: ${speed.toFixed(
    1
  )} km/h`;
}

function update(): boolean {
  let newX = snake[0].x;
  let newY = snake[0].y;

  if (direction === altDirection.get(oldDirection)) {
    direction = oldDirection;
  }

  oldDirection = direction;
  switch (direction) {
    case "right":
      newX += BLOCK_SIZE;
      break;
    case "left":
      newX -= BLOCK_SIZE;
      break;
    case "up":
      newY -= BLOCK_SIZE;
      break;
    case "down":
      newY += BLOCK_SIZE;
      break;
  }

  if (
    newX < 0 ||
    newX >= canvasElement.width ||
    newY < 0 ||
    newY >= canvasElement.height ||
    snake
      .slice(0, snake.length - 1)
      .some(
        (segment, index) => segment.x === newX && segment.y === newY && index
      )
  ) {
    return false;
  }

  if (newX === food.x && newY === food.y) {
    playBackground(Music.eat);
    score++;
    speed += SPEED_INCREASE;
    food = createFood();
  } else {
    snake.pop();
  }

  snake.unshift({ x: newX, y: newY });

  return true;
}

function gameLoop() {
  const cont = update();
  draw();

  if (!cont) {
    playBackground(Music.death);
    playBackground(Music.puff);
    if (score > record) localStorage.setItem(BEST_SCORE, score.toString());
    playAgainQuestion();
    return;
  } else if (snake.length === SIZE * SIZE) {
    localStorage.setItem(BEST_SCORE, score.toString());
    playAgainQuestion();
    return;
  }
  setTimeout(gameLoop, 1000 / speed);
}

function playAgainQuestion() {
  const text = "click to play again";
  const font = "px arial"
  const center = (SIZE * BLOCK_SIZE) / 2;
  let textSize = 8;
  ctx.font = textSize + font;
  while (ctx.measureText(text).width < canvasElement.width * 0.8) {
    textSize += 4;
    ctx.font = textSize + font;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(text, center, center);

  setInitValues();
  canvasElement.addEventListener("click", playGame);
}

setKeys();
setTouch();

function playGame() {
  canvasElement.removeEventListener("click", playGame);
  setInitValues();
  draw();
  playBackground(Music.background);
  gameLoop();
}

cover.onload = () => {
  canvasElement.addEventListener("click", playGame);
  ctx.drawImage(cover, 0, 0, canvasElement.width, canvasElement.height);
};
