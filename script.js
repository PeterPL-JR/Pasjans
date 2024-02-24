const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const menuDiv = document.getElementById("menu");

const ALL_CARDS = [];
let beginStacks = [];
let rows = [];
let STACK = [];

const TYPE_HERT = 0;
const TYPE_PIQUE = 1;
const TYPE_CARO = 2;
const TYPE_TREFLE = 3;

const COLOR_TYPE_BLACK = 0;
const COLOR_TYPE_RED = 1;

const COLOR_BLACK = "black";
const COLOR_RED = "#dd1a1e";

const _CARDS_COLORS = 4;
const _CARDS_TYPES = 13;
const _ROWS = 7;

const _AS = 0;
const _KING = 12;

const IMAGES_CARDS_PATH = "images/cards/";

const CARDS_IMAGES = [];
let stackCardsRevealed = 0;

let started = false;

let mouseX, mouseY;
let mouseMoving = false;
let mouseClicked = false;
let beginMousePos = null;

let movedCard = null;
let movedCardOldPos = null;
let movedCardOffset = null;

const SHELF_CORRECT_X = 40;
const SHELF_CORRECT_Y = 75;
const SHELF_SPACE = 20;

const WIDTH = _ROWS * (Card.WIDTH + SHELF_SPACE) - SHELF_SPACE + SHELF_CORRECT_X * 2;
const HEIGHT = 760;

function init() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    menuDiv.style.width = WIDTH + 'px';

    CARDS_IMAGES[TYPE_HERT] = loadImage(IMAGES_CARDS_PATH + "hert.png");
    CARDS_IMAGES[TYPE_PIQUE] = loadImage(IMAGES_CARDS_PATH + "pique.png");
    CARDS_IMAGES[TYPE_CARO] = loadImage(IMAGES_CARDS_PATH + "karo.png");
    CARDS_IMAGES[TYPE_TREFLE] = loadImage(IMAGES_CARDS_PATH + "trefle.png");

    canvas.onclick = function (event) {
        const LEFT_MOUSE_BUTTON = 0;
        if (event.button == LEFT_MOUSE_BUTTON) {
            const x = getMousePos(event).x;
            const y = getMousePos(event).y;
            mouseClick(x, y);
        }
    }
    canvas.onmousedown = function (event) {
        if(!started) {
            initMenu();
        }
        mouseClicked = true;
        beginMousePos = getMousePos(event);
        mouseStartMoving();
    }
    canvas.onmouseup = function () {
        mouseStopMoving();
    }

    canvas.onmousemove = function (event) {
        mouseX = getMousePos(event).x;
        mouseY = getMousePos(event).y;
        mouseMoving = true;
        updateMouseMoving(event);
    }
    canvas.onmouseout = function () {
        mouseStopMoving();
    }

    initGame();
    update();
}

function initGame() {
    // Create ordered stacks
    for (let i = 0; i < _CARDS_COLORS; i++) {
        beginStacks[i] = [];
        for (let j = 0; j < _CARDS_TYPES; j++) {
            const card = new Card(i, j);

            ALL_CARDS.push(card);
            beginStacks[i].push(card);
        }
    }
    createRows();
    createStack();

    initBeginPositions();
}

function createStack() {
    for (let i = 0; i < _CARDS_COLORS; i++) {
        const length = beginStacks[i].length;
        for (let j = 0; j < length; j++) {
            STACK.push(beginStacks[i].pop());
        }
    }
    STACK = shuffleArray(STACK);
}
function createRows() {
    for (let i = 0; i < _ROWS; i++) {
        rows[i] = [];
        for (let j = 0; j <= i; j++) {
            let randomIndex = null;
            do {
                randomIndex = getRandom(0, _CARDS_COLORS - 1);
            } while (beginStacks[randomIndex].length == 0);

            const randomCard = getRandomElement(beginStacks[randomIndex]);
            rows[i].push(randomCard);
        }
        rows[i][rows[i].length - 1].reveal(false);
    }
}

function initBeginPositions() {
    setRowsCardsPositions();
    
    for (let i = 0; i < STACK.length; i++) {
        STACK[i].setPosition(STACK_X1, STACK_Y);
    }
}
function setRowsCardsPositions() {
    for (let i = 0; i < _ROWS; i++) {
        for (let j = 0; j < rows[i].length; j++) {
            rows[i][j].setPosition(getRowCardPos(i, j).x, getRowCardPos(i, j).y);
        }
    }
}

function update() {
    requestAnimationFrame(update);
    render();

    if (movedCard && !movedCard.moving && mouseMoving && mouseClicked) {
        moveCard();
    }
    mouseMoving = false;
}

const GRADIENT_COLOR_1 = "green";
const GRADIENT_COLOR_2 = "#195610";

const STACK_X1 = WIDTH - Card.WIDTH - SHELF_CORRECT_X;
const STACK_X2 = WIDTH - Card.WIDTH * 2 - SHELF_CORRECT_X - SHELF_CORRECT_X;

const STACK_Y = SHELF_CORRECT_Y;

function render() {
    renderGradient(0, 0, WIDTH, HEIGHT, HEIGHT, [GRADIENT_COLOR_1, GRADIENT_COLOR_2]);

    renderStack();
    renderRows();
    renderBeginStacks();

    // Render Moved Card
    if (movedCard != null) {
        movedCard.render();
    }
}

function renderStack() {
    renderShelf(STACK_X1, STACK_Y);

    for (let i = STACK.length - 1; i >= stackCardsRevealed; i--) {
        tryRenderCard(STACK[i]);
    }
    for (let i = 0; i < stackCardsRevealed; i++) {
        tryRenderCard(STACK[i]);
    }
    renderStackCardsNumber();
}
function renderRows() {
    for (let i = 0; i < rows.length; i++) {
        renderShelf(getRowPos(i).x, getRowPos(i).y);

        const row = rows[i];
        for (let card of row) {
            tryRenderCard(card);
        }
    }
}
function renderBeginStacks() {
    for (let i = 0; i < _CARDS_COLORS; i++) {
        renderShelf(getBeginShelfPos(i).x, getBeginShelfPos(i).y);
        for (let j = 0; j < beginStacks[i].length; j++) {
            beginStacks[i][j].render();
        }
    }
}

function renderStackCardsNumber() {
    const unrevealedCards = STACK.length - stackCardsRevealed;
    if(unrevealedCards > 0) {
        const STACK_STR_OFFSET = Card.BORDER_RADIUS + 7;
        const STACK_STR_X = STACK_X1 + STACK_STR_OFFSET;
        const STACK_STR_Y = STACK_Y + Card.HEIGHT - STACK_STR_OFFSET;

        ctx.font = "bold 30px 'Verdana'";
        ctx.fillStyle = "white";
        ctx.fillText(unrevealedCards, STACK_STR_X, STACK_STR_Y);
    }
}

function checkCardAction(card) {
    return tryMoveToBeginStack(card) || tryMoveToRows(card);
}

function mouseClick(x, y) {
    if (contain(x, y, STACK_X1, STACK_Y, Card.WIDTH, Card.HEIGHT)) {
        if (stackCardsRevealed >= STACK.length) {
            resetStack();
            return;
        }
        clickStack();
    }
}
function moveCard() {
    movedCard.setPosition(mouseX - movedCardOffset.x, mouseY - movedCardOffset.y);
}

function moveCardArray(card, target, newPosition, targetType) {
    tryMoveFromStack(card, target, targetType);
    tryMoveFromRows(card, target, targetType);
    tryMoveFromBeginStack(card, target, targetType);
    
    card.setPosition(newPosition.x, newPosition.y);
    addCardToArray(card, target);
}
function moveCardArrayToRow(card, rowIndex, newPosition, cardIndex) {
    moveCardArray(card, rows[rowIndex], newPosition, MOVE_TO_ROWS);
    if(card.cardNext) {
        moveCardArrayToRow(card.cardNext, rowIndex, newPosition, cardIndex + 1);
        return;
    }
    card.resetCardNext();
    setRowsCardsPositions();

    doMove(MOVE_TO_ROWS, {target: rowIndex, cardsNumber: cardIndex});
}

function addCardToArray(card, array) {
    array.push(card);
}

function mouseStartMoving() {
    if (movedCard != null) return;

    for (let beginStack of beginStacks) {
        for (let card of beginStack) {
            if (tryMoveCard(card)) return;
        }
    }
    for (let row of rows) {
        for(let i = row.length - 1; i >= 0; i--) {
            let card = row[i];
            if (tryMoveRowCard(row, card)) return;
        }
    }
    for (let i = STACK.length - 1; i >= 0; i--) {
        if (tryMoveCard(STACK[i])) return;
    }
}
function mouseStopMoving() {
    mouseMoving = false;
    mouseClicked = false;
    beginMousePos = null;

    if (movedCard != null) {
        if (!checkCardAction(movedCard)) {
            movedCard.moveTo(movedCardOldPos.x, movedCardOldPos.y, CARD_SPEED_ROW, function () {
                resetMovedCardData();
            });
        } else {
            resetMovedCardData();
        }
    }
}

function resetMovedCardData() {
    movedCard.resetCardNext();
    movedCard = null;

    movedCardOldPos = null;
    movedCardOffset = null;
}

function startCartMoving(card) {
    movedCardOffset = {
        x: beginMousePos.x - card.x,
        y: beginMousePos.y - card.y
    }
    movedCard = card;
    movedCardOldPos = { x: card.x, y: card.y };
}

function updateMouseMoving(event) {
    const mousePos = getMousePos(event);
    const card = findCard(mousePos.x, mousePos.y, ALL_CARDS);
    setCanvasCursor(card ? "pointer" : "default");

    if(contain(mousePos.x, mousePos.y, STACK_X1, STACK_Y, Card.WIDTH, Card.HEIGHT)) {
        setCanvasCursor("pointer");
    }
}

function tryRenderCard(card) {
    if (card != movedCard) {
        card.render();
    }
}
function tryMoveCard(card) {
    if (card.active && isCardMoveable(card)) {
        startCartMoving(card);
        return true;
    }
    return false;
}
function tryMoveRowCard(row, card) {
    if(isCardMoveable(card)) {
        trySetCardNext(row, card);     
        startCartMoving(card);
        return true;
    }
    return false;
}
function trySetCardNext(row, card) {
    let cardNext = row[findCardIndex(card, row) + 1];
    if(cardNext) {
        card.setCardNext(cardNext);
        trySetCardNext(row, cardNext);
    }
}
function isCardMoveable(card) {
    return card.revealed && !card.moving && cardContain(beginMousePos.x, beginMousePos.y, card);
}

function revealCard(card, animation) {
    card.reveal(animation);
}

function clickStack() {
    if (movedCard != null) return;
    revealStackCard(stackCardsRevealed);

    stackCardsRevealed++;
    for (let i = 0; i < stackCardsRevealed; i++) {
        STACK[i].reveal(false);
        if(i < stackCardsRevealed - 1) {
            STACK[i].setActive(false);
        }
    }
    doMove(MOVE_CLICK_STACK);
}
function resetStack() {
    stackCardsRevealed = 0;
    for (let card of STACK) {
        card.hide(false);
        card.setPosition(STACK_X1, STACK_Y);
    }
    updateScore(RESET_STACK_POINTS);
    movesArray.push({type: MOVE_CLICK_STACK});
}

function revealStackCard(cardIndex, moveEndEvent = null) {
    STACK[cardIndex].moveTo(STACK_X2, STACK_Y, CARD_SPEED_STACK, moveEndEvent);
}

function hideStackCard(cardIndex, moveEndEvent = null) {
    STACK[cardIndex].moveTo(STACK_X1, STACK_Y, CARD_SPEED_STACK, moveEndEvent);
}

function checkVictory() {
    for(let row of rows) {
        for(let card of row) {
            if(!card.revealed) {
                return;
            }
        }
    }
    victory();
}

function victory() {
    stopTime();
    console.log("Victory!");
}