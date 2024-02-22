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
                    moveCardArrayToRow(card, target, positionTarget);
                    lastCard.setActive(false);
                    return true;
                }
            } else {
                if(card.number == _KING) {
                    moveCardArrayToRow(card, target, positionTarget);
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
            if (targetStack.length == 0 && card.number == _AS && !card.cardNext) {
                moveCardArray(card, targetStack, shelfPosition, TARGET_BEGIN_STACK);
                return true;
            } else {
                const lastCard = targetStack[targetStack.length - 1];
                if(lastCard && lastCard.colorType == card.colorType && lastCard.number == card.number - 1 && !card.cardNext) {
                    moveCardArray(card, targetStack, shelfPosition, TARGET_BEGIN_STACK);
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
function tryMoveFromStack(card, targetType) {
    let indexInSource = STACK.indexOf(card);

    if (indexInSource != -1) {
        if(targetType == TARGET_ROWS) var points = MOVE_TO_ROWS_POINTS;
        if(targetType == TARGET_BEGIN_STACK) var points = MOVE_TO_BEGIN_STACK_POINTS;
        STACK.splice(indexInSource, 1);

        stackCardsRevealed--;
        if (stackCardsRevealed < 0) {
            stackCardsRevealed = 0;
        }
        const lastCard = STACK[indexInSource - 1];
        if(lastCard) {
            lastCard.setActive(true);
        }
        doMove(null, points);
    }
}
function tryMoveFromRows(card, targetType) {
    for (let row of rows) {
        let indexInSource = row.indexOf(card);
        if (indexInSource != -1) {
            if(targetType == TARGET_BEGIN_STACK) var points = MOVE_TO_BEGIN_STACK_POINTS;
            row.splice(indexInSource, 1);

            const lastCard = row[row.length - 1];
            if (lastCard) {
                if(!lastCard.revealed) {
                    revealCard(lastCard, true);
                    updateScore(REVEAL_CARD_POINTS);
                } else {
                    lastCard.setActive(true);
                }
            }
            doMove(null, points);
        }
    }
}
function tryMoveFromBeginStack(card, targetType) {
    for (let bStack of beginStacks) {
        let indexInSource = bStack.indexOf(card);
        if (indexInSource != -1) {
            if(targetType == TARGET_ROWS) var points = MOVE_AGAIN_TO_ROWS_POINTS;
            bStack.splice(indexInSource, 1);
            
            const lastCard = bStack[indexInSource - 1];
            if(lastCard) {
                lastCard.setActive(true);
            }
            doMove(null, points);
        }
    }
}