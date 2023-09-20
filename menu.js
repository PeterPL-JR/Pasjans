const scoreMenu = document.querySelector("#score-div span");
const timeMenu = document.querySelector("#time-div span");
const movesMenu = document.querySelector("#moves-div span");

const undoButton = document.getElementById("undo-button");

let movesArray = [];

let score = 0;
let time = 0;
let moves = 0;

function initMenu() {
    setInterval(function() {
        updateTime();
    }, 1000);
    undoButton.onclick = undo;
}

function setMenuValue(menuElem, value) {
    menuElem.innerHTML = value;
}

function updateTime() {
    time++;
    if(time != 0 && time % 10 == 0) {
        updateScore(TIME_POINTS);
    }
    setMenuValue(timeMenu, getTimeString(time));
}

function doMove(points) {
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
}