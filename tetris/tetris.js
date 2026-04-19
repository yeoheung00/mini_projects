const canvas_field = document.querySelector("#field");
const ctx_field = canvas_field.getContext("2d");
const canvas_next = document.querySelector("#next");
const ctx_next = canvas_next.getContext("2d");
const [width, height] = [10, 22];
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
let field = Array.from({ length: height }, () => Array(width).fill(0));
let bag = [];
let hold = null;
let x, y;
let block = [];

document.addEventListener("keydown", event => {
    if (!isStarted) {
        isStarted = true;
        setTimeout(timerStart, INTERVAL);
        fillBag();
        return;
    }

    move(event.key);
});


let now, expect;
let INTERVAL = 2000;
function timerStart() {
    expect = Date.now();
    timerFunc();
}

function timerFunc() {
    if (!isStarted) return;
    now = Date.now();
    console.log(now);
    const offset = now - expect;
    expect += INTERVAL;
    move("ArrowDown");
    setTimeout(timerFunc, INTERVAL - offset);
}

function fillBag() {
    for (let i = 0; i < 3; i++) {
        const random = Math.floor(Math.random() * 7);
        if (bag.includes(random)) {
            i--;
            continue;
        }
        bag.push(random);
    }
    generate();
}

function generate() {
    block = shape[bag[0]];
    [x, y] = [startPoint[bag[0]].x, startPoint[bag[0]].y];
    bag.shift();
    while (bag.length !== 3) {
        const random = Math.floor(Math.random() * 7);
        if (bag.includes(random)) continue;
        bag.push(random);
    }
    drawField();
    drawNext();
}

function move(direction) {
    let dx = 0;
    let dy = 0;
    if (direction === "ArrowLeft") dx--;
    else if (direction === "ArrowRight") dx++;
    else if (direction === "ArrowDown") dy++;
    else if (direction === "ArrowUp") {
        rotate();
        return;
    }
    else if (direction === " ") {
        drop();
    }
    if (moveable(dx, dy, block)) {
        x += dx;
        y += dy;
        drawField();
    } else if (direction === "ArrowDown") {
        fixPosition();
        generate(bag[0]);
    }
}

function moveable(dx, dy, block_data) {
    return block_data.every((line, cy) => line.every((cell, cx) => cell === 0 || (x + cx + dx >= 0 && x + cx + dx < width && y + cy + dy >= 0 && y + cy + dy < height && field[y + cy + dy][x + cx + dx] === 0)));
}

function drop() {
    while (moveable(0, 1, block)) {
        move("ArrowDown");
    }
}

function rotate() {
    console.log("rotate");
    const size = block.length;
    let temp = Array.from({ length: size }, () => Array(size).fill(0));
    for (let cy = 0; cy < size; cy++) {
        for (let cx = 0; cx < size; cx++) {
            temp[cx][size - 1 - cy] = block[cy][cx];
        }
    }
    if (adjustable(temp)) block = temp;
    drawField();
}

function adjustable(block_data) {
    if (block_data.length === 3) {
        const offset = [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: -1 }];
        for (let i = 0; i < offset.length; i++) {
            const data = offset[i];
            if (moveable(data.dx, data.dy, block_data)) {
                x += data.dx;
                y += data.dy;
                return true;
            }
        }
    }
    else if (block_data.length === 4) {
        const offset = [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }, { dx: -1, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: -2 }];
        for (let i = 0; i < offset.length; i++) {
            const data = offset[i];
            if (moveable(data.dx, data.dy, block_data)) {
                x += data.dx;
                y += data.dy;
                return true;
            }
        }
    }
    return false;
}

function fixPosition() {
    console.log("fixed");
    block.forEach((line, cy) => {
        line.forEach((cell, cx) => {
            if (cell > 0 && y + cy >= 0) field[y + cy][x + cx] = cell;
        });
    });
    let lines = []
    field.forEach((line, cy) => {
        if (line.every(cell => cell !== 0)) lines.push(cy);
    });
    if (lines.length > 0) {
        console.log("break", lines);
        isStarted = false;
        deleteLine(lines);
    }
}

function deleteLine(lines) {
    lines.forEach(line => {
        deleteCell(line);
    });
    drawField();
}

function deleteCell(line){
    line.forEach((cell, cx)=>{
        cell = 0;
    })
}

function drawField() {
    ctx_field.clearRect(0, 0, canvas_field.width, canvas_field.height);

    for (let cy = 0; cy < height; cy++) {
        for (let cx = 0; cx < width; cx++) {
            //if ((cy % 2 === 0 && cx % 2 === 0) || (cy % 2 === 1 && cx % 2 === 1)) {
            //    ctx_field.fillStyle = "#c4c4c4";
            //    ctx_field.fillRect(cx * cell_size, cy * cell_size, cell_size, cell_size);
            //}
            if (field[cy][cx] > 0) {
                ctx_field.fillStyle = palette[field[cy][cx]];
                ctx_field.fillRect(cx * cell_size, cy * cell_size, cell_size, cell_size);
            } else {
                ctx_field.fillStyle = "#c4c4c4";
                //ctx_field.fillRect(cx * cell_size, cy * cell_size, cell_size, cell_size);
            }
        }
    }

    block.forEach((line, cy) => {
        line.forEach((cell, cx) => {
            ctx_field.fillStyle = palette[cell];
            if (cell > 0) ctx_field.fillRect((x + cx) * cell_size, (y + cy) * cell_size, cell_size, cell_size);
        });
    });
    ctx_field.fillStyle = "#ff0000";
    ctx_field.fillRect(0, cell_size * 2 - 1, width * cell_size, 2);
}

function drawNext() {
    ctx_next.clearRect(0, 0, canvas_next.width, canvas_next.height);
    const offset = [{ x: 1, y: 1 }, { x: 0, y: 0.5 }, { x: 0.5, y: 1 }, { x: 0.5, y: 1 }, { x: 0.5, y: 1 }, { x: 0.5, y: 1 }, { x: 0.5, y: 1 }]
    shape[bag[0]].forEach((line, cy) => {
        line.forEach((cell, cx) => {
            if (cell > 0) {
                ctx_next.fillStyle = palette[cell];
                ctx_next.fillRect(cx * cell_size + offset[bag[0]].x * cell_size, cy * cell_size + offset[bag[0]].y * cell_size, cell_size, cell_size);
            }
        });
    })
}