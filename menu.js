const scoreMenu = document.querySelector("#score-div span");
const timeMenu = document.querySelector("#time-div span");
const movesMenu = document.querySelector("#moves-div span");

const undoButton = document.getElementById("undo-button");

const MOVE_CLICK_STACK = 0;
const MOVE_TO_ROWS = 1;
const MOVE_TO_BEGIN_STACK = 2;

let movesArray = [];

let score = 0;
let time = 0;
let moves = 0;

function initMenu() {
    startTime();

    undoButton.onclick = undo;
    started = true;
}

function setMenuValue(menuElem, value) {
    menuElem.innerHTML = value;
}

function startTime() {
    timeInterval = setInterval(function() {
        updateTime();
    }, 1000);
}

function stopTime() {
    clearInterval(timeInterval);
}

function updateTime() {
    time++;
    if(time != 0 && time % 10 == 0) {
        updateScore(TIME_POINTS);
    }
    setMenuValue(timeMenu, getTimeString(time));
}

function doMove(moveType, points) {
    let move = {type: moveType};
    movesArray.push(move);

    moves++;
    if(points) {
        updateScore(points);
    }
    setMenuValue(movesMenu, moves);
}

const MOVE_TO_ROWS_POINTS = 5;
const MOVE_TO_BEGIN_STACK_POINTS = 10;

const MOVE_AGAIN_TO_ROWS_POINTS = -15;
const REVEAL_CARD_POINTS = 5;
const RESET_STACK_POINTS = -100;
const TIME_POINTS = -2;

function updateScore(points) {
    score += points;
    if(score < 0) score = 0;
    
    setMenuValue(scoreMenu, score);
}

function undo() {
    if(movesArray.length <= 0) return;
    moves++;
    setMenuValue(movesMenu, moves);

    let move = movesArray.pop();
    if(move.type == MOVE_CLICK_STACK) {
        undoClickStack();
    }
}

function undoClickStack() {
    if(stackCardsRevealed == 0) {
        for(let i = 0; i < STACK.length; i++) {
            revealStackCard(i);
            STACK[i].reveal(false);
        }
        stackCardsRevealed = STACK.length;
        return;
    }
    hideStackCard(stackCardsRevealed - 1, function() {
        stackCardsRevealed--;
    });
    STACK[stackCardsRevealed - 1].hide(false);
}