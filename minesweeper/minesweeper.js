const SETTING = document.getElementById("setting");
const BT_DIFF = document.querySelectorAll("#diff button");
const IP_ROW = document.getElementById("ip_row");
const IP_COLUMN = document.getElementById("ip_column");
const IP_MINE = document.getElementById("ip_mine");
const TITLE = document.getElementById("title");
const DP_TIME = document.getElementById("dp_time");
const DP_MINE = document.getElementById("dp_mine");
const FIELD = document.getElementById("field");

let diff = 0;
let diff_temp = 0;
let diffData = [[9, 9, 10], [16, 16, 40], [30, 16, 99]];
let width = 9;
let height = 9;
let mine = 10;
let revealed = 0;
let flagged = 0;
let isStarted = false;
let isEnded = false;
let fieldData = [];
let timer = 0;

function setDiff(_diff) {
    BT_DIFF[diff_temp].style.color = "var(--text)";
    BT_DIFF[diff_temp].style.fontWeight = "normal";

    diff_temp = _diff;
    BT_DIFF[diff_temp].style.color = "var(--primary)";
    BT_DIFF[diff_temp].style.fontWeight = "bold";

    if (diff_temp < 3) {
        IP_COLUMN.value = diffData[diff_temp][0];
        IP_ROW.value = diffData[diff_temp][1];
        IP_MINE.value = diffData[diff_temp][2];
    }

    IP_COLUMN.disabled = diff_temp != 3;
    IP_ROW.disabled = diff_temp != 3;
    IP_MINE.disabled = diff_temp != 3;
}

function popup(open) {

    BT_DIFF[0].style.color = "var(--text)";
    BT_DIFF[0].style.fontWeight = "normal";
    BT_DIFF[1].style.color = "var(--text)";
    BT_DIFF[1].style.fontWeight = "normal";
    BT_DIFF[2].style.color = "var(--text)";
    BT_DIFF[2].style.fontWeight = "normal";
    BT_DIFF[3].style.color = "var(--text)";
    BT_DIFF[3].style.fontWeight = "normal";
    BT_DIFF[diff].style.color = "var(--primary)";
    BT_DIFF[diff].style.fontWeight = "bold  ";

    IP_COLUMN.disabled = diff_temp != 3;
    IP_ROW.disabled = diff_temp != 3;
    IP_MINE.disabled = diff_temp != 3;

    IP_COLUMN.value = width;
    IP_ROW.value = height;
    IP_MINE.value = mine;
    SETTING.style.display = open ? "flex" : "none";
    if (!open) diff_temp = diff;
}

function apply() {
    diff = diff_temp;
    width = parseInt(IP_COLUMN.value);
    height = parseInt(IP_ROW.value);
    mine = parseInt(IP_MINE.value);
    SETTING.style.display = "none";
    refresh();
}






class Room {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._type = "safe";
        this._isRevealed = false;
        this._isFlagged = false;
        this._hintNum = 0;
        this._element = document.createElement("button");
        this.element.classList.add("element_mine");
        this.element.addEventListener("mousedown", (event) => {
            if (event.button === 0) this.reveal();
            else if (event.button === 2) this.flag();
        });
    }

    get x() { return this._x; }
    get y() { return this._y; }

    get type() { return this._type; }
    setType(type) { this._type = type; }

    get isRevealed() { return this._isRevealed; }
    reveal() {
        if (this.isRevealed || this.isFlagged || isEnded) return;
        if (!isStarted) {
            isStarted = true;
            timerStart();
        }
        this._isRevealed = true;
        if (this.type === "safe") {
            this.element.style.backgroundColor = "var(--sub-primary)"
            this.element.innerText = this.hintNum === 0 ? "" : this.hintNum;
            revealed++;
            if (this.hintNum === 0) openNeighbor(this.x, this.y);
            if (flagged + revealed === width * height && flagged === mine) gameClear();
        } else {
            this.element.style.backgroundColor = "var(--caution)";
            this.element.innerHTML = "<img src='src/mine.svg' alt='flag'/>"
            gameOver();
        }
    }

    get isFlagged() { return this._isFlagged }
    flag() {
        if (this.isRevealed || isEnded) return;
        this._isFlagged = !this._isFlagged;
        this.isFlagged ? flagged++ : flagged--;
        this.element.innerHTML = this.isFlagged ? "<img src='src/flag.svg' alt='flag'/>" : "";
        DP_MINE.innerText = `${flagged}/${mine}`;
        if (flagged + revealed === width * height && flagged === mine) gameClear();
    }

    get hintNum() { return this._hintNum; }
    setHintNum(hintNum) { this._hintNum = hintNum; }

    get element() { return this._element }
}

function openNeighbor(x, y) {
    for (let offset_y = -1; offset_y < 2; offset_y++) {
        for (let offset_x = -1; offset_x < 2; offset_x++) {
            let target_x = x + offset_x;
            let target_y = y + offset_y;
            if (target_x < 0 || target_x > width - 1 || target_y < 0 || target_y > height - 1 || (offset_x == 0 && offset_y == 0)) continue;
            let targetData = fieldData[target_y][target_x];
            if (!targetData.isRevealed) targetData.reveal();
        }
    }
}

function gameOver() {
    isStarted = false;
    isEnded = true;
    console.log("Game Over!!");
    TITLE.innerText = "게임 오버!!";
    fieldData.forEach(row => {
        row.forEach(data => {
            if (!data.isRevealed && !data.isFlagged && data.type === "mine") {
                data.element.style.backgroundColor = "var(--sub-primary)";
                data.element.innerHTML = "<img src='src/mine.svg' alt='flag'/>"
            }
        });
    });
}

function gameClear() {
    isStarted = false;
    isEnded = true;
    console.log("Game Clear!!");
    TITLE.innerText = "게임 클리어!!";
}

let startTime;
let expectedTime;
function timerStart() {
    if (!isStarted) return;
    startTime = Date.now();
    expectedTime = startTime + 1000;
    setTimeout(timerFunc, 1000);
}

function timerFunc() {
    if (!isStarted) return;
    timer++;
    const nowTime = Date.now();
    const timeOffset = Date.now() - expectedTime;
    expectedTime += 1000;
    console.log(nowTime);
    DP_TIME.innerText = String(Math.floor(timer / 60)).padStart(2, '0') + ":" + String(timer % 60).padStart(2, '0');
    if (isStarted) setTimeout(timerFunc, 1000 - timeOffset);
}

function refresh() {
    TITLE.innerText = "지뢰찾기";
    isStarted = false;
    isEnded = false;
    revealed = 0;
    flagged = 0;
    fieldData = [];
    timer = 0;
    DP_TIME.innerText = "00:00";
    DP_MINE.innerText = `0/${mine}`;
    let rows = document.querySelectorAll(".mine_row");
    rows.forEach(element => {
        FIELD.removeChild(element);
    });

    //필드 구성
    for (let y = 0; y < height; y++) {
        let mine_row = [];
        let element_row = document.createElement("div");
        element_row.className = "mine_row";
        for (let x = 0; x < width; x++) {
            let room = new Room(x, y);
            element_row.appendChild(room.element);
            mine_row.push(room);
        }
        FIELD.appendChild(element_row);
        fieldData.push(mine_row);
    }

    //지뢰 데이터 생성
    for (let i = 0; i < mine; i++) {
        let ranX = Math.floor(Math.random() * width);
        let ranY = Math.floor(Math.random() * height);
        let selectedRoom = fieldData[ranY][ranX]; //랜덤으로 지뢰가 될 칸 설정
        if (selectedRoom.type == "safe") {
            selectedRoom.setType("mine");
            //인접 지뢰 개수 종합
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    let xx = ranX + x;
                    let yy = ranY + y;
                    if (xx < 0 || xx > width - 1 || yy < 0 || yy > height - 1 || (x == 0 && y == 0)) continue;
                    let targetData = fieldData[yy][xx];
                    targetData.setHintNum(targetData.hintNum + 1);
                }
            }
        } else { //이미 지뢰라면 재시행
            i--;
            continue;
        }
    }
}

refresh();
