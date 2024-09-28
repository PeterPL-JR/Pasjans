// Check move to
function tryMoveToRows(card) {
    for(let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let lastCard = row[row.length - 1];
        if(card == lastCard) continue;

        let targetPosition = lastCard ? {x: lastCard.x, y: lastCard.y} : getRowPos(i);

        if(isIntersectionEnough(card, targetPosition)) {
            let positionTarget = getRowCardPos(i, row.length);

            if(lastCard) {
                if(lastCard.number == card.number + 1 && lastCard.colorIndex != card.colorIndex) {
                    moveCardArrayToRow(card, row, positionTarget, 1);
                    lastCard.setActive(false);
                    return true;
                }
            } else {
                if(card.number == _KING) {
                    moveCardArrayToRow(card, row, positionTarget, 1);
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
                moveCardArray(card, targetStack, shelfPosition, MOVE_TO_BEGIN_STACK);
                return true;
            } else {
                const lastCard = targetStack[targetStack.length - 1];
                if(lastCard && lastCard.colorType == card.colorType && lastCard.number == card.number - 1 && !card.cardNext) {
                    moveCardArray(card, targetStack, shelfPosition, MOVE_TO_BEGIN_STACK);
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
function tryMoveFromStack(card, target, targetType) {
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
        if(targetType != MOVE_TO_ROWS) {
            doMove(targetType, {target, sourceType: MOVE_FROM_STACK});
        }
    }
}
function tryMoveFromRows(card, target, targetType) {
    for (let i = 0; i < _ROWS; i++) {
        let row = rows[i];
        let indexInSource = row.indexOf(card);
        if (indexInSource != -1) {
            row.splice(indexInSource, 1);
            
            const lastCard = row[row.length - 1];
            if (lastCard) {
                var lastCardRevealed = lastCard ? lastCard.revealed : false;

                if(!lastCard.revealed) {
                    revealNewCard(lastCard, true);
                    updateScore(REVEAL_CARD_POINTS);
                } else {
                    lastCard.setActive(true);
                }
            }
            if(targetType != MOVE_TO_ROWS) {
                doMove(targetType, {target, sourceType: MOVE_FROM_ROWS, source: row, lastCardRevealed});
            }
        }
    }
}
function tryMoveFromBeginStack(card, target, targetType) {
    for (let i = 0; i < beginStacks.length; i++) {
        let bStack = beginStacks[i];
        let indexInSource = bStack.indexOf(card);
        if (indexInSource != -1) {
            bStack.splice(indexInSource, 1);
            
            const lastCard = bStack[indexInSource - 1];
            if(lastCard) {
                lastCard.setActive(true);
            }
            if(targetType != MOVE_TO_ROWS) {
                doMove(targetType, {target, sourceType: MOVE_FROM_BEGIN_STACK, source: bStack});
            }
        }
    }
}

// Click auto move
function clickMoveCardToBeginStack(card, beginStackIndex) {
    if(beginStacks[beginStackIndex].indexOf(card) != -1) {
        return;
    }
    movedCard = card;
    card.setActive(false);
    let pos = getBeginShelfPos(beginStackIndex);
    card.moveTo(pos.x, pos.y, CARD_SPEED_ROW, function() {
        movedCard = null;
        card.setActive(true);
    });
    beginStacks[beginStackIndex].push(card);
}

function clickMoveCardToRow(card, rowIndex) {
    if(rows[rowIndex].indexOf(card) != -1) {
        return;
    }
    movedCard = card;
    card.setActive(false);
    let pos = getRowCardPos(rowIndex, rows[rowIndex].length);
    card.moveTo(pos.x, pos.y, CARD_SPEED_ROW, function() {
        movedCard = null;
        card.setActive(true);
    });
    rows[rowIndex].push(card);
}

function clickMoveFromStack(card) {
    let removeAction = function(card) {
        STACK.splice(STACK.indexOf(card), 1);
        stackCardsRevealed--;
    };

    // Check begin stacks
    if(checkBeginStacksClickMove(card, removeAction)) {
        return;
    }
    // Check rows
    checkRowsClickMove(card, removeAction);
}

function clickMoveFromBeginStack(card) {
    checkRowsClickMove(card, function(card) {
        for(let i = 0; i < beginStacks.length; i++) {
            if(beginStacks[i].indexOf(card) != -1) {
                beginStacks[i].pop();
                if(!isEmpty(beginStacks[i])) {
                    last(beginStacks[i]).setActive(true);
                }
                break;
            }
        }
    });
}

function clickMoveFromRow(card) {
    let cardRowIndex = -1;
    for(let i = 0; i < rows.length; i++) {
        if(rows[i].indexOf(card) != -1) {
            cardRowIndex = i;
            break;
        }
    }

    let removeAction = function() {
        rows[cardRowIndex].pop();
        if(!isEmpty(rows[cardRowIndex])) {
            last(rows[cardRowIndex]).reveal(true);
        }
    };

    // Check begin stacks
    if(checkBeginStacksClickMove(card, removeAction)) {
        return;
    }
    // Check rows
    checkRowsClickMove(card, removeAction);
}

function checkBeginStacksClickMove(card, removeAction) {
    let beginStackIndex = -1;
    if(card.number == 0) {
        if(beginStacks[card.colorType].length == 0) {
            beginStackIndex = card.colorType;
        } else {
            for(let i = 0; i < beginStacks.length; i++) {
                if(isEmpty(beginStacks[i])) {
                    beginStackIndex = i;
                    break;
                }
            }
        }
    } else {
        for(let i = 0; i < beginStacks.length; i++) {
            if(beginStacks[i].length > 0) {
                let lastCard = last(beginStacks[i]);
                if(card.colorType == lastCard.colorType && card.number == lastCard.number + 1) {
                    beginStackIndex = i;
                    lastCard.setActive(false);
                    break;
                }
            }
        }
    }
    if(beginStackIndex != -1) {
        movedCard = card;
        clickMoveCardToBeginStack(card, beginStackIndex);
        removeAction(card);
        return true;
    }
    return false;
}

function checkRowsClickMove(card, removeAction) {
    let rowIndex = -1;
    for(let i = 0; i < rows.length; i++) {
        const KING_CARD = 12;
        if(rows[i].length == 0) {
            if(card.number == KING_CARD) {
                rowIndex = i;
                break;
            }
        } else {
            let lastCard = rows[i][rows[i].length - 1];
            if(card.colorIndex != lastCard.colorIndex && card.number == lastCard.number - 1) {
                rowIndex = i;
                break;
            }
        }
    }
    if(rowIndex != -1) {
        movedCard = card;
        clickMoveCardToRow(card, rowIndex);
        removeAction(card);
    }
}