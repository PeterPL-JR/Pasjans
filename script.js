const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

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

const CARDS_IMAGES = [];

class Card {
    static WIDTH = 110;
    static HEIGHT = Card.WIDTH * (11/7);
    
    static IMAGE_SIZE = Card.WIDTH * 0.8;
    static SUB_IMAGE_SIZE = Card.WIDTH * 0.3;
    static BORDER_RADIUS = 7;
    static SUB_IMAGE_CORRECT = 6;

    static COLOR = "white";
    static BORDER_COLOR = "gray";

    constructor(color, number) {
        this.colorType = color;
        this.number = number;

        this.displayedNumber = this.number + 1;
        if(this.number == 0) this.displayedNumber = "A";
        if(this.number == 10) this.displayedNumber = "J";
        if(this.number == 11) this.displayedNumber = "Q";
        if(this.number == 12) this.displayedNumber = "K";

        this.color = (color == TYPE_HERT || color == TYPE_CARO) ? COLOR_RED : COLOR_BLACK;
        this.image = CARDS_IMAGES[color];
        this.revealed = false;
    }
    render(x, y) {
        if(this.revealed) this.#renderHeads(x, y);
        else this.#renderTails(x, y);
    }

    #renderHeads(x, y) {
        renderRoundRect(x, y, Card.WIDTH, Card.HEIGHT, Card.BORDER_RADIUS, Card.COLOR, Card.BORDER_COLOR);

        // Render Card Image
        const IMAGE_X = x + Card.WIDTH / 2 - Card.IMAGE_SIZE / 2;
        const IMAGE_Y = y + Card.HEIGHT - Card.IMAGE_SIZE - 30;
        ctx.drawImage(this.image, IMAGE_X, IMAGE_Y, Card.IMAGE_SIZE, Card.IMAGE_SIZE);

        // Render Card Sub Image
        const SUB_IMAGE_X = x + Card.WIDTH - Card.SUB_IMAGE_SIZE - Card.SUB_IMAGE_CORRECT;
        const SUB_IMAGE_Y = y + Card.SUB_IMAGE_CORRECT;
        ctx.drawImage(this.image, SUB_IMAGE_X, SUB_IMAGE_Y, Card.SUB_IMAGE_SIZE, Card.SUB_IMAGE_SIZE);
    
        // Render Number
        ctx.fillStyle = this.color;
        ctx.font = `bold ${Card.SUB_IMAGE_SIZE}px Verdana`;

        const TEXT_X = x + 7;
        const TEXT_Y = y + Card.SUB_IMAGE_SIZE;
        ctx.fillText(this.displayedNumber, TEXT_X, TEXT_Y);
    }
    #renderTails(x, y) {
        const TAILS_COLOR_1 = "#4163cb";
        const TAILS_COLOR_2 = "#224098";

        const TAILS_BORDER_COLOR = "white";
        const TAILS_BORDER_SIZE = 8;
        renderRoundRect(x, y, Card.WIDTH, Card.HEIGHT, Card.BORDER_RADIUS, TAILS_BORDER_COLOR, Card.BORDER_COLOR);
        
        const TAILS_BACK_X = x + TAILS_BORDER_SIZE;
        const TAILS_BACK_Y = y + TAILS_BORDER_SIZE;

        const TAILS_BACK_WIDTH = Card.WIDTH - TAILS_BORDER_SIZE * 2;
        const TAILS_BACK_HEIGHT = Card.HEIGHT - TAILS_BORDER_SIZE * 2;
        renderRoundGradient(TAILS_BACK_X, TAILS_BACK_Y, TAILS_BACK_WIDTH, TAILS_BACK_HEIGHT, Card.BORDER_RADIUS, Card.WIDTH, [TAILS_COLOR_1, TAILS_COLOR_2]);
    
        const INNER_BORDER_COLOR = "#6fa3f2";
        const INNER_BORDER_SIZE = 5;
        const INNER_RECT_CORRECT = 10;
        
        const INNER_RECT_X = TAILS_BACK_X + INNER_RECT_CORRECT;
        const INNER_RECT_Y = TAILS_BACK_Y + INNER_RECT_CORRECT;

        const INNER_RECT_WIDTH = TAILS_BACK_WIDTH - INNER_RECT_CORRECT * 2;
        const INNER_RECT_HEIGHT = TAILS_BACK_HEIGHT - INNER_RECT_CORRECT * 2;
        renderRoundRect(INNER_RECT_X, INNER_RECT_Y, INNER_RECT_WIDTH, INNER_RECT_HEIGHT, TAILS_BORDER_SIZE / 2, "#0000", INNER_BORDER_COLOR, INNER_BORDER_SIZE);
    }

    reveal() {
        this.revealed = true;
    }
    hide() {
        this.revealed = false;
    }
}

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

    initGame();
    update();
}

function initGame() {
    // Create ordered stacks
    for(let i = 0; i < _CARDS_COLORS; i++) {
        beginStacks[i] = [];
        for(let j = 0; j < _CARDS_TYPES; j++) {
            beginStacks[i].push(new Card(i, j));
        }
    }

    for(let i = 0; i < _ROWS; i++) {
        rows[i] = [];
        for(let j = 0; j <= i; j++) {
            let randomIndex = null;
            do {
                randomIndex = getRandom(0, _CARDS_COLORS - 1);
            } while(beginStacks[randomIndex].length == 0);

            const randomCard = getRandomElement(beginStacks[randomIndex]);
            rows[i].push(randomCard);
        }
        rows[i][rows[i].length - 1].reveal();
    }

    for(let i = 0; i < _CARDS_COLORS; i++) {
        const length = beginStacks[i].length;
        for(let j = 0; j < length; j++) {
            STACK.push(beginStacks[i].pop());
        }
    }
    STACK = shuffleArray(STACK);
}

function update() {
    requestAnimationFrame(update);
    render();
}

const GRADIENT_COLOR_1 = "green";
const GRADIENT_COLOR_2 = "#195610";

function render() {
    renderGradient(0, 0, WIDTH, HEIGHT, HEIGHT, [GRADIENT_COLOR_1, GRADIENT_COLOR_2]);

    // Render Begin Stacks
    for(let i = 0; i < _CARDS_COLORS; i++) {
        renderShelf(SHELF_CORRECT + i * (Card.WIDTH + SHELF_SPACE), SHELF_CORRECT);
    }

    // Render Stack
    const STACK_X1 = WIDTH - Card.WIDTH - SHELF_CORRECT;
    const STACK_X2 = WIDTH - Card.WIDTH * 2 - SHELF_CORRECT - SHELF_CORRECT;
    
    const STACK_Y = SHELF_CORRECT; 
    renderShelf(STACK_X1, STACK_Y);

    // Render Cards Rows
    const ROWS_Y = 250;
    for(let i = 0; i < _ROWS; i++) {
        const ROWS_X = SHELF_CORRECT + i * (Card.WIDTH + SHELF_SPACE);

        renderShelf(ROWS_X, ROWS_Y);
        for(let j = 0; j < rows[i].length; j++) {
            rows[i][j].render(ROWS_X, ROWS_Y + j * (Card.SUB_IMAGE_SIZE + Card.SUB_IMAGE_CORRECT * 2));
        }
    }
}

function renderShelf(x, y) {
    renderRoundGradient(x, y, Card.WIDTH, Card.HEIGHT, Card.BORDER_RADIUS, Card.HEIGHT, ["#0000", "#0008"]);
}

function renderRoundRect(x, y, width, height, roundRate, color, borderColor=color, lineWidth=1) {
    ctx.fillStyle = color;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, roundRate);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function renderGradient(x, y, width, height, radius, colors) {
    const gradient = getGradient(x, y, width, height, radius, colors);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
}
function renderRoundGradient(x, y, width, height, roundRate, radius, colors) {
    const gradient = getGradient(x, y, width, height, radius, colors);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, roundRate);
    ctx.fill();
    ctx.closePath();
}

function getGradient(x, y, width, height, radius, colors) {
    const GRADIENT_X = x + width / 2;
    const GRADIENT_Y = y + height / 2;

    const gradient = ctx.createRadialGradient(GRADIENT_X, GRADIENT_Y, 0, GRADIENT_X, GRADIENT_Y, radius);
    for(let i = 0; i < colors.length; i++) {
        gradient.addColorStop(i, colors[i]);
    }
    return gradient;
}
function loadImage(path) {
    const img = document.createElement("img");
    img.src = path;
    return img;
}

function shuffleArray(array) {
    const bufferArray = Array.from(array);
    const newArray = [];

    while(bufferArray.length != 0) {
        const randomIndex = getRandom(0, bufferArray.length - 1);
        newArray.push(bufferArray.splice(randomIndex, 1)[0]);
    }
    return newArray;
}

function getRandomElement(array) {
    if(array.length == 0) return null;

    const randomIndex = getRandom(0, array.length - 1);
    return array.splice(randomIndex, 1)[0];
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}