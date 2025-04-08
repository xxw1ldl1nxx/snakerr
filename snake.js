"use strict";
const canvasElement = document.getElementById("canvas");
const ctx = canvasElement.getContext("2d");
const scoreElement = document.getElementById("score");
const SIZE = 10;
const START_SPEED = 2;
const SPEED_INCREASE = 0.2;
const BLOCK_SIZE = Math.floor((window.innerHeight - 200) / SIZE);
const BEST_SCORE = "best_score";
canvasElement.width = SIZE * BLOCK_SIZE;
canvasElement.height = SIZE * BLOCK_SIZE;
function timerDeco(f) {
    return function (...args) {
        const start = performance.now();
        const res = f(...args);
        console.log(performance.now() - start);
        return res;
    };
}
function createFood() {
    const free = [];
    for (let x = 0; x < canvasElement.width; x += BLOCK_SIZE) {
        for (let y = 0; y < canvasElement.height; y += BLOCK_SIZE) {
            if (snake.some((segment) => segment.x === x && segment.y === y) ||
                (x === (food === null || food === void 0 ? void 0 : food.x) && y === (food === null || food === void 0 ? void 0 : food.y))) {
                continue;
            }
            free.push({ x, y });
        }
    }
    return free[Math.floor(Math.random() * free.length)];
}
const ss = Math.floor(SIZE / 2) * BLOCK_SIZE - BLOCK_SIZE;
let snake = [
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
let food;
food = createFood();
function hasValue(val) {
    return typeof val === "string";
}
let score = 0;
const storage_record = localStorage.getItem(BEST_SCORE);
const record = hasValue(storage_record) ? parseInt(storage_record) : 0;
let direction = "right";
let oldDirection = "right";
let speed = START_SPEED;
const altDirection = new Map([
    ["right", "left"],
    ["left", "right"],
    ["up", "down"],
    ["down", "up"],
]);
const deadAudio = new Audio();
deadAudio.src = "audio/dead.mp3";
const normalAudio = new Audio();
normalAudio.src = "audio/normal.mp3";
normalAudio.loop = true;
const eatAudio = new Audio();
eatAudio.src = "audio/eat.mp3";
eatAudio.volume = 0.4;
const cover = new Image();
cover.src = "img/cover.jpg";
function playBackground(bg) {
    switch (bg) {
        case "normal":
            normalAudio.play();
            break;
        case "dead":
            normalAudio.pause();
            deadAudio.play();
            break;
        case "eat":
            if (!eatAudio.ended) {
                eatAudio.currentTime = 0;
            }
            eatAudio.play();
    }
}
function drawSnakeHead(x, y) {
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
            ctx.fillRect(x + BLOCK_SIZE, y + BLOCK_SIZE - (toothX + toothW), -toothH, toothW);
            ctx.fillStyle = "red";
            ctx.fillRect(x + BLOCK_SIZE, y + toothX + toothW, -mouthH, BLOCK_SIZE - (toothX + toothW) * 2);
            ctx.fillStyle = "yellow";
            ctx.fillRect(x + BLOCK_SIZE - eyeY, y + eyeX, -eyeH, eyeW);
            ctx.fillRect(x + BLOCK_SIZE - eyeY, y + BLOCK_SIZE - (eyeX + eyeW), -eyeH, eyeW);
            break;
        case "left":
            ctx.fillStyle = "white";
            ctx.fillRect(x, y + toothX, toothH, toothW);
            ctx.fillRect(x, y + BLOCK_SIZE - (toothX + toothW), toothH, toothW);
            ctx.fillStyle = "red";
            ctx.fillRect(x, y + toothX + toothW, mouthH, BLOCK_SIZE - (toothX + toothW) * 2);
            ctx.fillStyle = "yellow";
            ctx.fillRect(x + eyeY, y + eyeX, eyeH, eyeW);
            ctx.fillRect(x + eyeY, y + BLOCK_SIZE - (eyeX + eyeW), eyeH, eyeW);
            break;
        case "up":
            ctx.fillStyle = "white";
            ctx.fillRect(x + toothX, y, toothW, toothH);
            ctx.fillRect(x + BLOCK_SIZE - (toothX + toothW), y, toothW, toothH);
            ctx.fillStyle = "red";
            ctx.fillRect(x + toothX + toothW, y, BLOCK_SIZE - (toothX + toothW) * 2, mouthH);
            ctx.fillStyle = "yellow";
            ctx.fillRect(x + eyeX, y + eyeY, eyeW, eyeH);
            ctx.fillRect(x + BLOCK_SIZE - (eyeX + eyeW), y + eyeY, eyeW, eyeH);
            break;
        case "down":
            ctx.fillStyle = "white";
            ctx.fillRect(x + toothX, y + BLOCK_SIZE, toothW, -toothH);
            ctx.fillRect(x + BLOCK_SIZE - (toothX + toothW), y + BLOCK_SIZE, toothW, -toothH);
            ctx.fillStyle = "red";
            ctx.fillRect(x + toothX + toothW, y + BLOCK_SIZE, BLOCK_SIZE - (toothX + toothW) * 2, -mouthH);
            ctx.fillStyle = "yellow";
            ctx.fillRect(x + eyeX, y + BLOCK_SIZE - eyeY, eyeW, -eyeH);
            ctx.fillRect(x + BLOCK_SIZE - (eyeX + eyeW), y + BLOCK_SIZE - eyeY, eyeW, -eyeH);
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
    scoreElement.textContent = `score: ${score} | best: ${record} | speed: ${speed.toFixed(1)} km/h`;
}
function update() {
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
    if (newX < 0 ||
        newX >= canvasElement.width ||
        newY < 0 ||
        newY >= canvasElement.height ||
        snake
            .slice(0, snake.length - 1)
            .some((segment, index) => segment.x === newX && segment.y === newY && index)) {
        return false;
    }
    if (newX === food.x && newY === food.y) {
        playBackground("eat");
        score++;
        speed += SPEED_INCREASE;
        food = createFood();
    }
    else {
        snake.pop();
    }
    snake.unshift({ x: newX, y: newY });
    return true;
}
function gameLoop() {
    const cont = update();
    draw();
    if (!cont) {
        playBackground("dead");
        if (score > record)
            localStorage.setItem(BEST_SCORE, score.toString());
        // alert("Game over!");
        return;
    }
    else if (snake.length === SIZE * SIZE) {
        localStorage.setItem(BEST_SCORE, snake.length.toString());
        // alert("You win!");
        return;
    }
    setTimeout(gameLoop, 1000 / speed);
}
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
function playGame() {
    canvasElement.removeEventListener("click", playGame);
    draw();
    playBackground("normal");
    gameLoop();
}
cover.onload = () => {
    canvasElement.addEventListener("click", playGame);
    ctx.drawImage(cover, 0, 0, canvasElement.width, canvasElement.height);
};
