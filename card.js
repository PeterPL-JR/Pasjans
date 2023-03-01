const CARD_SPEED_STACK = 20;
const CARD_SPEED_ROW = 50;
const CARD_SPEED_SPINNING = 1;

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

        this.renderingWidth = Card.WIDTH;
        this.spinningAngle = 0;
        this.spinning = false;
    }
    update() {
        if (this.distance >= this.maxDistance) {
            this.setPosition(this.targetX, this.targetY);
            if (this.endEvent && this.endEvent != null) {
                this.endEvent();
            }

            this.targetX = this.targetY = this.xSpeed = this.ySpeed = this.maxDistance = undefined;
            this.endEvent = undefined;
            this.moving = false;
        }
        if (this.xSpeed != undefined && this.ySpeed != undefined && this.maxDistance != undefined) {
            this.x += this.xSpeed;
            this.y += this.ySpeed;

            this.x = Math.round(this.x);
            this.y = Math.round(this.y);

            this.distance += Math.sqrt(Math.pow(this.xSpeed, 2) + Math.pow(this.ySpeed, 2));
        }
        if (this.spinning) {
            this.spinningAngle += CARD_SPEED_SPINNING;

            if (this.spinningAngle >= 90) {
                this.spinningAngle = 0;
                this.spinning = false;
            }
        }
    }
    render() {
        this.update();
        if (this.x == null || this.y == null) return;
        if (this.spinning) {
            const radians = toRadians(this.spinningAngle);
            const sin = Math.sin(radians);
        }

        if (this.revealed) this.#renderHeads(this.x, this.y);
        else this.#renderTails(this.x, this.y);
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

        this.maxDistance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
        this.distance = 0;
        this.endEvent = endEvent;
        this.moving = true;
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

    reveal(animation = false) {
        this.revealed = true;
        if (animation) {
            this.spinning = true;
        }
    }
    hide() {
        this.revealed = false;
    }
}