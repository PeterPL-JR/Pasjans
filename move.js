// Check move to
function tryMoveToRows(card) {
}
function tryMoveToBeginStack(card) {
    for (let i = 0; i < beginStacks.length; i++) {
        const stackX = getBeginShelfPos(i).x;
        const stackY = getBeginShelfPos(i).y;

        const cardRect = { x: card.x, y: card.y, width: Card.WIDTH, height: Card.HEIGHT };
        const shelfRect = { x: stackX, y: stackY, width: Card.WIDTH, height: Card.HEIGHT };

        if(isIntersectionEnough(cardRect, shelfRect)) {
            const targetStack = beginStacks[i];
            if (targetStack.length == 0 && card.number == _AS) {
                moveCardArray(card, targetStack, getBeginShelfPos(i));
                return true;
            } else {
                const lastCard = targetStack[targetStack.length - 1];
                if(lastCard && lastCard.colorType == card.colorType && lastCard.number == card.number - 1) {
                    moveCardArray(card, targetStack, getBeginShelfPos(i));
                    for(let i = 0; i < targetStack.length - 1; i++) {
                        targetStack[i].setActive(false);
                    }
                    return true;
                }
            }
        }
    }
    return false;
}

// Check move from
function tryMoveFromStack(card) {
    let indexInSource = STACK.indexOf(card);

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
}
function tryMoveFromRows(card) {
    let indexInSource;

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
}
function tryMoveFromBeginStack(card) {
    let indexInSource;

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
}