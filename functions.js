function shuffleArray(array) {
    const bufferArray = Array.from(array);
    const newArray = [];

    while (bufferArray.length != 0) {
        const randomIndex = getRandom(0, bufferArray.length - 1);
        newArray.push(bufferArray.splice(randomIndex, 1)[0]);
    }
    return newArray;
}

function countRectsIntersection(rectangle1, rectangle2) {
    const x1 = rectangle1.x;
    const y1 = rectangle1.y;
    const x2 = rectangle1.x + rectangle1.width;
    const y2 = rectangle1.y + rectangle1.height;

    const x3 = rectangle2.x;
    const y3 = rectangle2.y;
    const x4 = rectangle2.x + rectangle2.width;
    const y4 = rectangle2.y + rectangle2.height;

    const x5 = Math.max(x1, x3);
    const y5 = Math.max(y1, y3);

    const x6 = Math.min(x2, x4);
    const y6 = Math.min(y2, y4);

    if (x5 > x6 || y5 > y6) {
        return 0;
    }

    const point1 = { x: x5, y: y5 };
    const point2 = { x: x6, y: y6 };

    const point3 = { x: x5, y: y6 };
    const point4 = { x: x6, y: y5 };

    const obj = [point1, point2, point3, point4];
    return (obj[0].x - obj[1].x) * (obj[0].y - obj[1].y);
}
function isIntersectionEnough(card, shelfPosition) {
    const CARD_SHELF_INTERSECTION_RATE = 0.6;

    const cardRect = { x: card.x, y: card.y, width: Card.WIDTH, height: Card.HEIGHT };
    const shelfRect = { x: shelfPosition.x, y: shelfPosition.y, width: Card.WIDTH, height: Card.HEIGHT };

    const cardArea = Card.WIDTH * Card.HEIGHT;
    let intersection = countRectsIntersection(cardRect, shelfRect);

    return intersection > 0 && (intersection / cardArea) > CARD_SHELF_INTERSECTION_RATE;
}

function getMousePos(event) {
    return {
        x: event.clientX - canvas.offsetLeft,
        y: event.clientY - canvas.offsetTop
    };
}
function findCard(x, y, array) {
    return array.find(function (elem) {
        return elem.revealed && cardContain(x, y, elem);
    });
}
function cardContain(x, y, card) {
    return contain(x, y, card.x, card.y, Card.WIDTH, Card.HEIGHT);
}
function contain(pointX, pointY, x, y, width, height) {
    return pointX >= x && pointX < x + width && pointY >= y && pointY < y + height;
}

function getRandomElement(array) {
    if (array.length == 0) return null;

    const randomIndex = getRandom(0, array.length - 1);
    return array.splice(randomIndex, 1)[0];
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toRadians(deg) {
    return deg * Math.PI / 180;
}
function toDegrees(rad) {
    return rad * 180 / Math.PI;
}