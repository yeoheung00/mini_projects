class Block {
    constructor() {
        this.shape;
        this.x;
        this.y;
    }
    generate(type) {
        this.shape = shape[type];
        this.x = startPoint[type].x;
        this.y = startPoint[type].y;
        this.draw();
    }
    move(direction) {
        let dx = 0;
        let dy = 0;
        if (direction === "ArrowLeft") dx--;
        else if (direction === "ArrowRight") dx++;
        else if (direction === "ArrowDown") dy++;
        else if (direction === "ArrowUp") {
            this.rotate();
            return;
        }
        if (this.moveable(dx, dy, this.shape)) {
            this.x += dx;
            this.y += dy;
            drawField();
        } else if (direction === "ArrowDown") {
            this.fixPosition();
        }
    }
    moveable(dx, dy, shape) {
        return shape.every((line, y) => line.every((cell, x) => cell === 0 || (this.x + x + dx >= 0 && this.x + x + dx < width && this.y + y + dy >= 0 && this.y + y + dy < height && field[this.y + y + dy][this.x + x + dx] === 0)));
    }
    rotate() {
        console.log("rotate");
        const size = this.shape.length;
        let temp = Array.from({ length: size }, () => Array(size).fill(0));
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                temp[x][size - 1 - y] = this.shape[y][x];
            }
        }
        if (this.adjustable(temp)) this.shape = temp;
        this.draw();
    }
    adjustable(shape) {
        if (shape.length === 3) {
            const offset = [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: -1 }];
            for (let i = 0; i < offset.length; i++) {
                const data = offset[i];
                if (this.moveable(data.dx, data.dy, shape)) {
                    this.x += data.dx;
                    this.y += data.dy;
                    return true;
                }
            }
        }
        else if (shape.length === 4) {
            const offset = [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }, { dx: -1, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: -2 }];
            for (let i = 0; i < offset.length; i++) {
                const data = offset[i];
                if (this.moveable(data.dx, data.dy, shape)) {
                    this.x += data.dx;
                    this.y += data.dy;
                    return true;
                }
            }
        }
        return false;
    }
    fixPosition() {
        this.shape.forEach((line, y) => {
            line.forEach((cell, x) => {
                if (cell > 0 && this.y + y >= 0) field[this.y + y][this.x + x] = cell;
            });
        });
        field.forEach((line, y) => {
            if (line.every((cell, x) => cell > 0)) {
                field.splice(y, 1);
                field.unshift(Array(width).fill(0));
            }
        });
        if (field[1].every(cell => cell === 0)) {
            bag.shift();
            while (bag.length !== 3) {
                const random = Math.floor(Math.random() * 7);
                if (!bag.includes(random)) bag.push(random);
            }
            this.generate(bag[0]);

            drawNext();
        } else {
            console.log("Game over");
            isStarted = false;
        }
    }
    draw() {
        this.shape.forEach((line, y) => {
            line.forEach((cell, x) => {
                ctx_field.fillStyle = palette[cell];
                if (cell > 0) ctx_field.fillRect((this.x + x) * cell_size, (this.y + y) * cell_size, cell_size, cell_size);
            });
        });
    }
}

const canvas_field = document.querySelector("#field");
const ctx_field = canvas_field.getContext("2d");
const canvas_next = document.querySelector("#next");
const ctx_next = canvas_next.getContext("2d");
const width = 10;
const height = 22;
const cell_size = canvas_field.width / width;
const startPoint = [{ x: 4, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 0 }];
const palette = ["", "#ffff00", "#00ffff", "#ff00ff", "#0000ff", "#ff9900", "#ff0000", "#00ff00"];
const shape = [[
    [1, 1],
    [1, 1]
], [
    [0, 0, 0, 0],
    [2, 2, 2, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
], [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0]
], [
    [4, 0, 0],
    [4, 4, 4],
    [0, 0, 0]
], [
    [0, 0, 5],
    [5, 5, 5],
    [0, 0, 0]
], [
    [6, 6, 0],
    [0, 6, 6],
    [0, 0, 0]
], [
    [0, 7, 7],
    [7, 7, 0],
    [0, 0, 0]
]];
let isStarted = false;
let blockExist = false;
let block = new Block();
let bag = [];
let INTERVAL = 1000;
let field = Array.from({ length: height }, () => Array(width).fill(0));

document.addEventListener('keydown', (event) => {
    if (!isStarted) {
        isStarted = true;
        fillBag();
        setTimeout(timerStart, INTERVAL);
        return;
    }
    block.move(event.key);
});

function fillBag() {
    let count = 0;
    for (let i = 0; i < 3; i++) {
        const random = Math.floor(Math.random() * 7);
        if (bag.includes(random)) {
            i--;
            continue;
        }
        bag.push(random);
    }
    block.generate(bag[0]);
}

function drawNext() {
    ctx_next.clearRect(0, 0, canvas_next.width, canvas_next.height);
    const offset = [{ x: 1, y: 1 }, { x: 0, y: 0.5 }, { x: 0.5, y: 1 }, { x: 0.5, y: 1 }, { x: 0.5, y: 1 }, { x: 0.5, y: 1 }, { x: 0.5, y: 1 }]
    shape[bag[1]].forEach((line, y) => {
        line.forEach((cell, x) => {
            if (cell > 0) {
                ctx_next.fillStyle = palette[cell];
                ctx_next.fillRect(x * cell_size + offset[bag[1]].x * cell_size, y * cell_size + offset[bag[1]].y * cell_size, cell_size, cell_size);
            }
        });
    })
}

function timerStart() {
    if (!isStarted) return;
    block.move("ArrowDown");
    setTimeout(timerStart, INTERVAL);
}


function drawField() {
    ctx_field.clearRect(0, 0, canvas_field.width, canvas_field.height);
    //ctx_field.fillStyle = "#c4c4c4";
    block.draw();
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            //if ((y % 2 === 0 && x % 2 === 0) || (y % 2 === 1 && x % 2 === 1)) {
            //    ctx_field.fillStyle = "#c4c4c4";
            //    ctx_field.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
            //}
            if (field[y][x] > 0) {
                ctx_field.fillStyle = palette[field[y][x]];
                ctx_field.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
            } else {
                ctx_field.fillStyle = "#c4c4c4";
                //ctx_field.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
            }
        }
    }
    ctx_field.fillStyle = "#ff0000";
    ctx_field.fillRect(0, cell_size * 2 - 1, width * cell_size, 2);
}