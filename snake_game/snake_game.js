const score_board = document.querySelector("span");
const field = document.querySelector("canvas");
const ctx = field.getContext("2d");

let isStarted = false;
let direction = "E";
let direction_next = "E";
let startTime, expectedTime;
let snake = ["8:8", "7:8"];
let foods = [];
let score = 0;
const freq = 300;
const width = 17;
const height = 17;
const offset = field.width / width;

document.addEventListener("keydown", (event) => {
    if (!isStarted) {
        isStarted = true;
        timerStart();
    }
    else if (event.key === "Escape") isStarted = false;
    if (event.key === "ArrowUp" && direction !== "S") direction_next = "N";
    else if (event.key === "ArrowRight" && direction !== "W") direction_next = "E";
    else if (event.key === "ArrowDown" && direction !== "N") direction_next = "S";
    else if (event.key === "ArrowLeft" && direction !== "E") direction_next = "W";
});



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
    let [x, y] = snake[0].split(":");
    if (direction === "N") y--;
    else if (direction === "E") x++;
    else if (direction === "S") y++;
    else if (direction === "W") x--;
    if (snake.includes(`${x}:${y}`) || (x < 0 || x >= width) || (y < 0 || y >= height)) {
        gameOver();
        return;
    }
    snake.unshift(`${x}:${y}`);
    if (!isGrow()) snake.pop();
    drawSnake();
}

function gameOver() {
    isStarted = false;
    alert("게임 오버!!\n점수: " + score);
    score = 0;
    snake = ["8:8", "7:8"];
    makeFood();
    drawSnake();
}

function isGrow() {
    if (!foods.includes(snake[0])) return false;
    score++;
    score_board.innerText = `점수: ${score}`;
    foods = foods.filter((food) => food !== snake[0]);
    if (foods.length === 0) makeFood();
    return true;
}

function makeFood() {
    foods = [];
    let amount = Math.floor(Math.random() * 2) + 1;
    console.log("make", amount, "foods");
    while (amount > 0) {
        let food = Math.floor(Math.random() * 17) + ":" + Math.floor(Math.random() * 17);
        if (snake.includes(food) || foods.includes(food)) continue;
        foods.push(food);
        amount--;
    }
    console.log(foods);
}

function drawSnake() {
    ctx.clearRect(0, 0, field.width, field.height);
    drawField();
    drawFoods();
    snake.forEach(data => {
        const [x, y] = data.split(":");
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(x * offset, y * offset, offset, offset);
    });
}

function drawFoods() {
    foods.forEach(food => {
        const [x, y] = food.split(":");
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(x * offset + offset / 2, y * offset + offset / 2, offset * 0.4, 0, 2 * Math.PI);
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