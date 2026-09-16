console.log("Tic-Tac-Toe ready");

const gameEl = document.getElementById("game");
const boardSizeSelect = document.getElementById("boardSize");
const resetBtn = document.querySelector(".reset");
const newGameBtn = document.querySelector(".newGamebtn");
const msgContainer = document.querySelector(".msg-container");
const msg = document.getElementById("msg");
const turnIndicator = document.getElementById("turnIndicator");
const scoreOEl = document.getElementById("scoreO");
const scoreXEl = document.getElementById("scoreX");
const scoreDrawEl = document.getElementById("scoreDraw");

// How many in a row counts as a win, per board size. Bigger boards need a
// longer run so the game stays a real challenge instead of ending in the
// first couple of moves.
const WIN_LENGTH_BY_SIZE = { 3: 3, 6: 4, 9: 5 };
const AUTO_RESTART_DELAY_MS = 2200;

let size = 3;
let winLength = 3;
let board = [];
let turnO = true;
let roundOver = false;
let autoRestartTimer = null;
let scoreO = 0, scoreX = 0, scoreDraw = 0;

function buildBoard() {
    size = parseInt(boardSizeSelect.value, 10) || 3;
    winLength = WIN_LENGTH_BY_SIZE[size] || 3;
    board = new Array(size * size).fill("");
    turnO = true;
    roundOver = false;

    gameEl.style.setProperty("--size", String(size));
    gameEl.innerHTML = "";

    for (let i = 0; i < size * size; i++) {
        const box = document.createElement("button");
        box.type = "button";
        box.className = "box";
        box.dataset.index = String(i);
        gameEl.appendChild(box);
    }
    updateTurnIndicator();
}

function updateTurnIndicator() {
    turnIndicator.textContent = `Turn: ${turnO ? "O" : "X"}`;
}

function updateScoreboard() {
    scoreOEl.textContent = String(scoreO);
    scoreXEl.textContent = String(scoreX);
    scoreDrawEl.textContent = String(scoreDraw);
}

// Checks only the four lines that pass through the cell that was just
// played (row, col) — horizontal, vertical, and both diagonals — and
// returns the winning cell indices, or null if there's no win yet.
function checkWinFrom(row, col) {
    const player = board[row * size + col];
    if (!player) return null;

    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    for (const [dr, dc] of directions) {
        const cells = [[row, col]];

        let r = row + dr, c = col + dc;
        while (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === player) {
            cells.push([r, c]);
            r += dr;
            c += dc;
        }

        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === player) {
            cells.push([r, c]);
            r -= dr;
            c -= dc;
        }

        if (cells.length >= winLength) {
            return cells.map(([rr, cc]) => rr * size + cc);
        }
    }
    return null;
}

function highlightWin(cellIndexes) {
    cellIndexes.forEach((i) => {
        const box = gameEl.children[i];
        if (box) box.classList.add("win");
    });
}

function disableAllBoxes() {
    Array.from(gameEl.children).forEach((box) => {
        box.disabled = true;
    });
}

function showMessage(text) {
    msg.textContent = text;
    msgContainer.classList.remove("hide");
}

function scheduleAutoRestart() {
    clearTimeout(autoRestartTimer);
    autoRestartTimer = setTimeout(startNewRound, AUTO_RESTART_DELAY_MS);
}

function endRound(result, winCellIndexes) {
    roundOver = true;
    disableAllBoxes();

    if (result === "draw") {
        scoreDraw++;
        showMessage("It's a draw!");
    } else {
        if (winCellIndexes) highlightWin(winCellIndexes);
        if (result === "O") scoreO++; else scoreX++;
        showMessage(`Congratulations! Player ${result} wins!`);
    }

    updateScoreboard();
    scheduleAutoRestart();
}

function handleBoxClick(event) {
    const box = event.target.closest(".box");
    if (!box || roundOver) return;

    const index = Number(box.dataset.index);
    if (Number.isNaN(index) || board[index] !== "") return;

    const player = turnO ? "O" : "X";
    board[index] = player;
    box.textContent = player;
    box.disabled = true;
    turnO = !turnO;

    const row = Math.floor(index / size);
    const col = index % size;

    const winCellIndexes = checkWinFrom(row, col);
    if (winCellIndexes) {
        endRound(player, winCellIndexes);
        return;
    }

    if (board.every((v) => v !== "")) {
        endRound("draw", null);
        return;
    }

    updateTurnIndicator();
}

function startNewRound() {
    clearTimeout(autoRestartTimer);
    msgContainer.classList.add("hide");
    buildBoard();
}

function resetEverything() {
    clearTimeout(autoRestartTimer);
    scoreO = 0;
    scoreX = 0;
    scoreDraw = 0;
    updateScoreboard();
    msgContainer.classList.add("hide");
    buildBoard();
}

gameEl.addEventListener("click", handleBoxClick);
resetBtn.addEventListener("click", resetEverything);
newGameBtn.addEventListener("click", startNewRound);
boardSizeSelect.addEventListener("change", resetEverything);

buildBoard();
updateScoreboard();
