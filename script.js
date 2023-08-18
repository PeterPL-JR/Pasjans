const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const ALL_CARDS = [];
let beginStacks = [];
let rows = [];
let STACK = [];

const TYPE_HERT = 0;
const TYPE_PIQUE = 1;
const TYPE_CARO = 2;
const TYPE_TREFLE = 3;

const COLOR_RED = "#dd1a1e";
const COLOR_BLACK = "black";

const _CARDS_COLORS = 4;
const _CARDS_TYPES = 13;
const _ROWS = 7;

const _AS = 0;
const CARDS_IMAGES = [];

let stackCardsRevealed = 0;

let mouseX, mouseY;
let mouseMoving = false;
let mouseClicked = false;
let beginMousePos = null;

let movedCard = null;
let movedCardOldPos = null;
let movedCardOffset = null;

const SHELF_CORRECT = 30;
const SHELF_SPACE = 20;

const WIDTH = _ROWS * (Card.WIDTH + SHELF_SPACE) - SHELF_SPACE + SHELF_CORRECT * 2;
const HEIGHT = 740;

function init() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    CARDS_IMAGES[TYPE_HERT] = loadImage("images/hert.png");
    CARDS_IMAGES[TYPE_PIQUE] = loadImage("images/pique.png");
    CARDS_IMAGES[TYPE_CARO] = loadImage("images/karo.png");
    CARDS_IMAGES[TYPE_TREFLE] = loadImage("images/trefle.png");

    canvas.onclick = function (event) {
        const LEFT_MOUSE_BUTTON = 0;
        if (event.button == LEFT_MOUSE_BUTTON) {
            const x = getMousePos(event).x;
            const y = getMousePos(event).y;
            mouseClick(x, y);
        }
    }
    canvas.onmousedown = function (event) {
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

    for (let i = 0; i < _CARDS_COLORS; i++) {
        const length = beginStacks[i].length;
        for (let j = 0; j < length; j++) {
            STACK.push(beginStacks[i].pop());
        }
    }
    STACK = shuffleArray(STACK);

    initBeginPositions();
}

function initBeginPositions() {
    for (let i = 0; i < _ROWS; i++) {
        for (let j = 0; j < rows[i].length; j++) {
            rows[i][j].setPosition(getRowX(i), getRowY() + j * (Card.SUB_IMAGE_SIZE + Card.SUB_IMAGE_CORRECT * 2));
        }
    }
    for (let i = 0; i < STACK.length; i++) {
        STACK[i].setPosition(STACK_X1, STACK_Y);
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

const STACK_X1 = WIDTH - Card.WIDTH - SHELF_CORRECT;
const STACK_X2 = WIDTH - Card.WIDTH * 2 - SHELF_CORRECT - SHELF_CORRECT;

const STACK_Y = SHELF_CORRECT;

function render() {
    renderGradient(0, 0, WIDTH, HEIGHT, HEIGHT, [GRADIENT_COLOR_1, GRADIENT_COLOR_2]);

    // Render Begin Stacks
    for (let i = 0; i < _CARDS_COLORS; i++) {
        renderShelf(getBeginShelfPos(i).x, getBeginShelfPos(i).y);
        for (let j = 0; j < beginStacks[i].length; j++) {
            beginStacks[i][j].render();
        }
    }

    // Render Stack
    renderShelf(STACK_X1, STACK_Y);

    for (let i = STACK.length - 1; i >= stackCardsRevealed; i--) {
        tryRenderCard(STACK[i]);
    }
    for (let i = 0; i < stackCardsRevealed; i++) {
        tryRenderCard(STACK[i]);
    }

    // Render Cards Rows
    for (let i = 0; i < rows.length; i++) {
        renderShelf(getRowX(i), getRowY());

        const row = rows[i];
        for (let card of row) {
            tryRenderCard(card);
        }
    }

    // Render Moved Card
    if (movedCard != null) {
        movedCard.render();
    }

    // Render stack cards amount
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
    const cardArea = Card.WIDTH * Card.HEIGHT;

    // Check begin/end stacks
    let stackIndex = -1;
    let mostInsersection = -1;

    for (let i = 0; i < beginStacks.length; i++) {
        const stackX = getBeginShelfPos(i).x;
        const stackY = getBeginShelfPos(i).y;

        const cardRect = { x: card.x, y: card.y, width: Card.WIDTH, height: Card.HEIGHT };
        const shelfRect = { x: stackX, y: stackY, width: Card.WIDTH, height: Card.HEIGHT };

        const intersection = countRectsIntersection(cardRect, shelfRect);
        if (intersection > 0 && intersection > mostInsersection && (intersection / cardArea) > 0.6) {
            mostInsersection = intersection;
            stackIndex = i;
        }
    }
    if (stackIndex != -1) {
        const targetStack = beginStacks[stackIndex];
        if (targetStack.length == 0 && card.number == _AS) {
            moveCardArray(card, targetStack, getBeginShelfPos(stackIndex));
            return true;
        } else {
            const lastCard = targetStack[targetStack.length - 1];
            if(lastCard && lastCard.colorType == card.colorType && lastCard.number == card.number - 1) {
                moveCardArray(card, targetStack, getBeginShelfPos(stackIndex));
                for(let i = 0; i < targetStack.length - 1; i++) {
                    targetStack[i].setActive(false);
                }
                return true;
            }
        }
    }
    return false;
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

function moveCardArray(card, target, newPosition) {
    let indexInSource;

    // Check STACK
    indexInSource = STACK.indexOf(card)
    if (indexInSource != -1) {
        STACK.splice(indexInSource, 1);

        stackCardsRevealed--;
        if (stackCardsRevealed < 0) {
            stackCardsRevealed = 0;
        }
        const lastCard = STACK[indexInSource - 1];
        if(lastCard) {
            lastCard.setActive(true);
        }
    }
    // Check begin stack
    for (let i = 0; i < _CARDS_COLORS; i++) {
        indexInSource = beginStacks[i].indexOf(card);
        if (indexInSource != -1) {
            beginStacks[i].splice(indexInSource, 1);
            const lastCard = beginStacks[i][indexInSource - 1];
            if(lastCard) {
                lastCard.setActive(true);
            }
        }
    }
    // Check rows
    for (let i = 0; i < _ROWS; i++) {
        indexInSource = rows[i].indexOf(card);
        if (indexInSource != -1) {
            const row = rows[i];
            row.splice(indexInSource, 1);

            const lastCard = row[row.length - 1];
            if (lastCard) {
                lastCard.reveal(true);
            }
        }
    }

    card.setPosition(newPosition.x, newPosition.y);
    addCardToArray(card, target);
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
        for (let card of row) {
            if (tryMoveCard(card)) return;
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
    if (card.active && card.revealed && !card.moving && cardContain(beginMousePos.x, beginMousePos.y, card)) {
        startCartMoving(card);
        return true;
    }
    return false;
}

function clickStack() {
    if (movedCard != null) return;
    STACK[stackCardsRevealed].moveTo(STACK_X2, STACK_Y, CARD_SPEED_STACK);

    stackCardsRevealed++;
    for (let i = 0; i < stackCardsRevealed; i++) {
        STACK[i].reveal(false);
        if(i < stackCardsRevealed - 1) {
            STACK[i].setActive(false);
        }
    }
}
function resetStack() {
    stackCardsRevealed = 0;
    for (let card of STACK) {
        card.hide();
        card.setPosition(STACK_X1, STACK_Y);
    }
}

function getBeginShelfPos(index) {
    return { x: SHELF_CORRECT + index * (Card.WIDTH + SHELF_SPACE), y: SHELF_CORRECT };
}

function getRowX(rowIndex) {
    return SHELF_CORRECT + rowIndex * (Card.WIDTH + SHELF_SPACE);
}
function getRowY() {
    return 250;
}

function setCanvasCursor(cursorType) {
    canvas.style.setProperty("cursor", cursorType);
}