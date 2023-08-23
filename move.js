// Check move to
function tryMoveToRows(card) {
    for(let i = 0; i < rows.length; i++) {
        let lastCard = rows[i][rows[i].length - 1];
        if(card == lastCard) continue;

        let targetPosition = lastCard ? {x: lastCard.x, y: lastCard.y} : getRowPos(i);

        if(isIntersectionEnough(card, targetPosition)) {
            let target = rows[i];
            let positionTarget = getRowCardPos(i, rows[i].length);

            if(lastCard) {
                if(lastCard.number == card.number + 1 && lastCard.colorIndex != card.colorIndex) {
                    moveCardArray(card, target, positionTarget);
                    lastCard.setActive(false);
                    return true;
                }
            } else {
                if(card.number == _KING) {
                    moveCardArray(card, target, positionTarget);
                    return true;
                }
            }
        }
    }
    return false;
}
function tryMoveToBeginStack(card) {
    for (let i = 0; i < beginStacks.length; i++) {
        const shelfPosition = getBeginShelfPos(i);

        if(isIntersectionEnough(card, shelfPosition)) {
            const targetStack = beginStacks[i];
            if (targetStack.length == 0 && card.number == _AS) {
                moveCardArray(card, targetStack, shelfPosition);
                return true;
            } else {
                const lastCard = targetStack[targetStack.length - 1];
                if(lastCard && lastCard.colorType == card.colorType && lastCard.number == card.number - 1) {
                    moveCardArray(card, targetStack, shelfPosition);
                    for(let j = 0; j < targetStack.length - 1; j++) {
                        targetStack[j].setActive(false);
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
    for (let row of rows) {
        let indexInSource = row.indexOf(card);
        if (indexInSource != -1) {
            row.splice(indexInSource, 1);

            const lastCard = row[row.length - 1];
            if (lastCard) {
                if(!lastCard.revealed) {
                    lastCard.reveal(true);
                } else {
                    lastCard.setActive(true);
                }
            }
        }
    }
}
function tryMoveFromBeginStack(card) {
    for (let bStack of beginStacks) {
        let indexInSource = bStack.indexOf(card);
        if (indexInSource != -1) {
            bStack.splice(indexInSource, 1);
            const lastCard = bStack[indexInSource - 1];
            if(lastCard) {
                lastCard.setActive(true);
            }
        }
    }
}