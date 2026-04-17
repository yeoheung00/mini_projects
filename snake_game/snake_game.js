const score_board = document.querySelector("span");
const field = document.querySelector("canvas");
const ctx = field.getContext("2d");
const buttons = document.querySelectorAll("button");

let isStarted = false;
let direction = "E";
let direction_next = "E";
let startTime, expectedTime;
let snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }];
let foods = [];
let score = 0;
const freq = 300;
const width = 17;
const height = 17;
const offset = field.width / width;
const keys = ["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"];
const eventHandler = (key) => {
        if (!isStarted) {
            isStarted = true;
            timerStart();
        }
        changeDirection(key);
}

buttons.forEach((button, index) => button.addEventListener('pointerdown', (event) => eventHandler(keys[index])));
document.addEventListener("keydown", (event) => eventHandler(event.key));

function changeDirection(key) {
    if (key === "ArrowUp" && direction !== "S") direction_next = "N";
    else if (key === "ArrowRight" && direction !== "W") direction_next = "E";
    else if (key === "ArrowDown" && direction !== "N") direction_next = "S";
    else if (key === "ArrowLeft" && direction !== "E") direction_next = "W";
}

function timerStart() {
    startTime = Date.now();
    expectedTime = Date.now();
    setTimeout(timerFunc, freq);
}

function timerFunc() {
    if (!isStarted) return;
    direction = direction_next;
    step();
    startTime = Date.now();
    expectedTime += freq;
    setTimeout(timerFunc, freq - startTime + expectedTime);
}

function step() {
    let head = { x: snake[0].x, y: snake[0].y };
    if (direction === "N") head.y--;
    else if (direction === "E") head.x++;
    else if (direction === "S") head.y++;
    else if (direction === "W") head.x--;
    if (snake.some(data => (data.x === head.x && data.y === head.y)) || (head.x < 0 || head.x >= width) || (head.y < 0 || head.y >= height)) {
        gameOver();
        return;
    }
    snake.unshift(head);
    if (!isGrow()) snake.pop();
    drawSnake();
}

function gameOver() {
    isStarted = false;
    alert("게임 오버!!\n점수: " + score);
    score = 0;
    snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }];
    direction = "E";
    direction_next = "E";
    makeFood();
    drawSnake();
}

function isGrow() {
    let head = { x: snake[0].x, y: snake[0].y };
    if (!foods.some(food => (food.x === head.x && food.y === head.y))) return false;
    score++;
    score_board.innerText = `점수: ${score}`;
    foods = foods.filter((food) => food.x !== head.x || food.y !== head.y);
    if (foods.length === 0) makeFood();
    return true;
}

function makeFood() {
    foods = [];
    let amount = Math.floor(Math.random() * 2) + 1;
    console.log("make", amount, "foods");
    while (amount > 0) {
        let food = { x: Math.floor(Math.random() * 17), y: Math.floor(Math.random() * 17) };
        if (snake.some(data => (data.x === food.x && data.y === food.y)) || foods.some(data => (data.x === food.x && data.y === food.y))) continue;
        foods.push(food);
        amount--;
    }
    console.log(foods);
}

function drawSnake() {
    ctx.clearRect(0, 0, field.width, field.height);
    drawField();
    drawFoods();
    const inner_offset = Math.floor(offset * 0.3 / 2);
    snake.forEach((data, index) => {
        ctx.fillStyle = "#006600";
        ctx.fillRect(data.x * offset, data.y * offset, offset, offset);
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(data.x * offset + inner_offset, data.y * offset + inner_offset, offset - inner_offset * 2, offset - inner_offset * 2);
        if (index !== 0) {
            const next = snake[index - 1];
            if (next.x === data.x) {
                if (next.y > data.y) ctx.fillRect(data.x * offset + inner_offset, data.y * offset + inner_offset + offset / 2, offset - inner_offset * 2, offset - inner_offset * 2);
                else ctx.fillRect(data.x * offset + inner_offset, data.y * offset + inner_offset - offset / 2, offset - inner_offset * 2, offset - inner_offset * 2);
            }
            else {
                if (next.x > data.x) ctx.fillRect(data.x * offset + inner_offset + offset / 2, data.y * offset + inner_offset, offset - inner_offset * 2, offset - inner_offset * 2);
                else ctx.fillRect(data.x * offset + inner_offset - offset / 2, data.y * offset + inner_offset, offset - inner_offset * 2, offset - inner_offset * 2);
            }
        }
    });
}

function drawFoods() {
    foods.forEach(food => {
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(food.x * offset + offset / 2, food.y * offset + offset / 2, offset * 0.4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function drawField() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            ctx.fillStyle = "#e9e9e9";
            if ((y % 2 === 0 && x % 2 === 0) || (y % 2 === 1 && x % 2 === 1)) {
                ctx.fillRect(x * offset, y * offset, offset, offset);
            }
        }
    }
}

makeFood();
drawSnake();