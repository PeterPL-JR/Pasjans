const CARD_SPEED_STACK = 20;
const CARD_SPEED_ROW = 50;
const CARD_SPEED_SPINNING = 18;

const MIN_SPIN_ANGLE = 0;
const MAX_SPIN_ANGLE = 180;

class Card {
    static WIDTH = 110;
    static HEIGHT = Card.WIDTH * (11 / 7);

    static IMAGE_SIZE = Card.WIDTH * 0.8;
    static SUB_IMAGE_SIZE = Card.WIDTH * 0.3;
    static BORDER_RADIUS = 7;
    static SUB_IMAGE_CORRECT = 6;

    static COLOR = "white";
    static BORDER_COLOR = "gray";

    constructor(color, number) {
        this.colorType = color;
        this.number = number;

        this.x = null;
        this.y = null;

        this.displayedNumber = this.number + 1;
        if (this.number == 0) this.displayedNumber = "A";
        if (this.number == 10) this.displayedNumber = "J";
        if (this.number == 11) this.displayedNumber = "Q";
        if (this.number == 12) this.displayedNumber = "K";

        this.color = (color == TYPE_HERT || color == TYPE_CARO) ? COLOR_RED : COLOR_BLACK;
        this.image = CARDS_IMAGES[color];
        this.revealed = false;
        this.moving = false;
        
        this.spinning = false;
        this.spinningAngle = MIN_SPIN_ANGLE;

        this.renderingWidth = Card.WIDTH;
    }
    update() {
        if(this.moving) {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
        }
        if(this.spinning) {
            this.#updateSpinning();
        }

        let xCond = this.xSpeed > 0 ? (this.x >= this.targetX) : (this.x <= this.targetX);
        let yCond = this.ySpeed > 0 ? (this.y >= this.targetY) : (this.y <= this.targetY);
        
        if(xCond && yCond) {
            this.setPosition(this.targetX, this.targetY);
            
            if (this.endEvent && this.endEvent != null) {
                this.endEvent();
            }
            
            this.moving = false;
            this.endEvent = null;
            this.xSpeed = this.ySpeed = this.targetX = this.targetY = undefined;
        }
    }
    render() {
        this.update();

        if(this.spinning) {
            this.#renderSpinning();
        } else {
            this.#renderOnPosition(this.x, this.y);
        }
    }
    #renderOnPosition(x, y) {        
        if (this.revealed) this.#renderHeads(x, y);
        else this.#renderTails(x, y);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    moveTo(x, y, speed, endEvent = null) {
        const xDist = x - this.x;
        const yDist = y - this.y;
        const angle = Math.atan2(yDist, xDist);

        this.xSpeed = Math.cos(angle) * speed;
        this.ySpeed = Math.sin(angle) * speed;

        this.targetX = x;
        this.targetY = y;

        this.endEvent = endEvent;
        this.moving = true;
    }

    #updateSpinning() {
        this.spinningAngle += CARD_SPEED_SPINNING;

        if(this.spinningAngle >= MAX_SPIN_ANGLE / 2) {
            this.revealed = true;
        }
        if(this.spinningAngle >= MAX_SPIN_ANGLE) {
            this.spinning = false;
            this.spinningAngle = MIN_SPIN_ANGLE;
        }
    }
    #renderSpinning() {
        let cos = -Math.cos(toRadians(this.spinningAngle));
        ctx.save();

        let xOffset = this.x + (Card.WIDTH - Card.WIDTH * cos) / 2;
        let yOffset = this.y;

        ctx.translate(xOffset, yOffset);
        ctx.scale(cos, 1);
        this.#renderOnPosition(0, 0);

        ctx.restore();
    }

    #renderHeads(x, y) {
        let xOffset = x;
        let yOffset = y;

        renderRoundRect(xOffset, yOffset, Card.WIDTH, Card.HEIGHT, Card.BORDER_RADIUS, Card.COLOR, Card.BORDER_COLOR);

        // Render Card Image
        const IMAGE_X = xOffset + Card.WIDTH / 2 - Card.IMAGE_SIZE / 2;
        const IMAGE_Y = yOffset + Card.HEIGHT - Card.IMAGE_SIZE - 30;
        ctx.drawImage(this.image, IMAGE_X, IMAGE_Y, Card.IMAGE_SIZE, Card.IMAGE_SIZE);

        // Render Card Sub Image
        const SUB_IMAGE_X = xOffset + Card.WIDTH - Card.SUB_IMAGE_SIZE - Card.SUB_IMAGE_CORRECT;
        const SUB_IMAGE_Y = yOffset + Card.SUB_IMAGE_CORRECT;
        ctx.drawImage(this.image, SUB_IMAGE_X, SUB_IMAGE_Y, Card.SUB_IMAGE_SIZE, Card.SUB_IMAGE_SIZE);

        // Render Number
        ctx.fillStyle = this.color;
        ctx.font = `bold ${Card.SUB_IMAGE_SIZE}px Verdana`;

        const TEXT_X = xOffset + 7;
        const TEXT_Y = yOffset + Card.SUB_IMAGE_SIZE;
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

        const INNER_BORDER_COLOR = "#5589d9";
        const INNER_BORDER_SIZE = 5;
        const INNER_RECT_CORRECT = 10;

        const INNER_RECT_X = TAILS_BACK_X + INNER_RECT_CORRECT;
        const INNER_RECT_Y = TAILS_BACK_Y + INNER_RECT_CORRECT;

        const INNER_RECT_WIDTH = TAILS_BACK_WIDTH - INNER_RECT_CORRECT * 2;
        const INNER_RECT_HEIGHT = TAILS_BACK_HEIGHT - INNER_RECT_CORRECT * 2;
        renderRoundRect(INNER_RECT_X, INNER_RECT_Y, INNER_RECT_WIDTH, INNER_RECT_HEIGHT, TAILS_BORDER_SIZE / 2, "#0000", INNER_BORDER_COLOR, INNER_BORDER_SIZE);
    }

    reveal(animation = false) {
        if(animation) {
            this.spinning = true;
        } else {
            this.revealed = true;
        }
        this.setActive(true);
    }
    hide() {
        this.revealed = false;
        this.setActive(false);
    }

    setActive(active) {
        this.active = active;
    }
}