function renderRoundRect(x, y, width, height, roundRate, color, borderColor = color, lineWidth = 1) {
    ctx.fillStyle = color;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctxRoundRect(x, y, width, height, roundRate);
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
    ctxRoundRect(x, y, width, height, roundRate);
    ctx.fill();
    ctx.closePath();
}

function renderShelf(x, y) {
    renderRoundGradient(x, y, Card.WIDTH, Card.HEIGHT, Card.BORDER_RADIUS, Card.HEIGHT, ["#0000", "#0008"]);
}

function ctxRoundRect(x, y, width, height, roundRate) {
    if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, roundRate);
    } else {
        ctx.rect(x, y, width, height);
    }
}

function getGradient(x, y, width, height, radius, colors) {
    const GRADIENT_X = x + width / 2;
    const GRADIENT_Y = y + height / 2;

    const gradient = ctx.createRadialGradient(GRADIENT_X, GRADIENT_Y, 0, GRADIENT_X, GRADIENT_Y, radius);
    for (let i = 0; i < colors.length; i++) {
        gradient.addColorStop(i, colors[i]);
    }
    return gradient;
}

function loadImage(path) {
    const img = document.createElement("img");
    img.src = path;
    return img;
}