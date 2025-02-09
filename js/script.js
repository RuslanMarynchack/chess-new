"use strict"

const selectors = {
    container: '.js-container',
    checkersWrapper: '.js-checkers',
    cell: '.js-checkers-cell',
    cellInner: '.js-checkers-cell-inner',
    figure: '.js-cell-figure',
    popup: '.js-figures-popup'
}

const classes = {
    figure: 'js-cell-figure',
    active: 'is-active',
    black: 'is-black',
    attack: 'is-attack',
    firstMove: 'is-first-move',
    lastMove: 'is-last-move',
    shah: 'is-shah'
}

const classesFigure = {
    pawn: 'is-pawn',
    king: 'is-king',
    horse: 'is-horse',
    rook: 'is-rook',
    bishop: 'is-bishop',
}

function handlerBoardSize(isBlack = false) {
    return isBlack ? 8 : -8;
}

const container = document.querySelector(selectors.container);
const speedAnimation = 700;
const attackedChess = [];

let listMoves = [];
let attackVectorToKing = [];
let previousListMovesTo = [];
let currentListMovesTo = [];
let listDefenderAndKingPieces = [];
let isBoardSize = handlerBoardSize(true);
let isTargetFigure = null;
let isTargetFigureRook = null;
let isTargetIndex = 0;
let isBlockedMove = false;
let isCurrentMove = 'black';

function createBoard() {
    if (!container) {
        return
    }

    const checkersWrapper = container.querySelector(selectors.checkersWrapper);
    let isBlackCell = false;

    if (!checkersWrapper) {
        return;
    }

    for (let i=0; i<8; i++) {
        isBlackCell = !isBlackCell;

        for (let j=0; j<8; j++) {
            const cell = document.createElement('div');
            const cellInner = document.createElement('div');

            cell.classList.add('checkers__cell', 'js-checkers-cell');
            cellInner.classList.add('checkers__cell-inner', 'js-checkers-cell-inner');

            isBlackCell = !isBlackCell;

            if (isBlackCell) {
                cell.classList.add(classes.black);
            }

            cell.append(cellInner);
            checkersWrapper.append(cell);
        }
    }

    arrangeFigures(checkersWrapper);
    handlerClickFigure();
    handlerClickFigureOnMove();
}

createBoard();

function arrangeFigures(wrapper) {
    const cellInners = [...wrapper.querySelectorAll(selectors.cellInner)];

    if (cellInners.length < 1) return;

    cellInners.forEach((cellInner, index) => {
        const figure = document.createElement('div');

        cellInner.closest(selectors.cell).setAttribute('data-index', index);
        figure.classList.add('checkers__cell-figure', 'js-cell-figure');

        if (index > 7 && index <= 15 || index > 47 && index <= 55) {
            cellInner.append(figure);
        } else if (index === 3 || index === 59) {
            cellInner.append(figure);
        } else if (index === 1 || index === 6 || index === 57 || index === 62) {
            // cellInner.append(figure);
        } else if (index === 0 || index === 19 || index === 56 || index === 63) {
            cellInner.append(figure);
        } else if (index === 2 || index === 5 || index === 58 || index === 61) {
            // cellInner.append(figure);
        }

        if (index > 7 && index <= 15) {
            addElementClassesWithAttributes(figure, classesFigure.pawn, true, "black", "♟");
        } else if (index > 47 && index <= 55) {
            addElementClassesWithAttributes(figure, classesFigure.pawn, true, "white", "♙");
        } else if (index === 3) {
            addElementClassesWithAttributes(figure, classesFigure.king, true, "black", "♚");
        } else if (index === 59) {
            addElementClassesWithAttributes(figure, classesFigure.king, true, "white", "♔");
        } else if (index === 1|| index === 6) {
            addElementClassesWithAttributes(figure, classesFigure.horse, false, "black", "♞");
        } else if (index === 57  || index === 62) {
            addElementClassesWithAttributes(figure, classesFigure.horse, false, "white", "♘");
        } else if (index === 0 || index === 19) {
            addElementClassesWithAttributes(figure, classesFigure.rook, true, "black", "♜");
        } else if (index === 56 || index === 63) {
            addElementClassesWithAttributes(figure, classesFigure.rook, true, "white", "♖");
        } else if (index === 2 || index === 5) {
            // addElementClassesWithAttributes(figure, classesFigure.bishop, false, "black", "♝");
        } else if (index === 58 || index === 61) {
            // addElementClassesWithAttributes(figure, classesFigure.bishop, false, "white", "♗");
        }
    });
}

// A function that adds the desired figure and class with data attributes for the figure element.
function addElementClassesWithAttributes(element, cls, isClsFirstMove, dataType, figure) {
    element.classList.add(cls);
    isClsFirstMove && element.classList.add(classes.firstMove);
    element.setAttribute('data-type', dataType);
    element.innerHTML = figure;
}

function handlerClickFigure() {
    const cells = [...container.querySelectorAll(selectors.cell)];

    if (cells.length < 1) return;

    cells.forEach(cell => {
        const figure = cell.querySelector(selectors.figure);

        if (!figure) return;

        figure.addEventListener('click', function () {
            let cell = this.closest(selectors.cell);

            if (listDefenderAndKingPieces.length > 0) {
                if (listDefenderAndKingPieces.includes(cell)) {
                    cell = this.closest(selectors.cell);
                } else {
                    return;
                }
            }

            if (cell && !cell.classList.contains(classes.attack) && this.dataset.type === isCurrentMove) {
                isTargetFigure = this;
                isTargetIndex = +cell.dataset.index;
                console.log(isTargetFigure)
                console.log(isCurrentMove)
            }
        });

        handlerFigures(figure, cells);
    });
}

function handlerClickFigureOnMove() {
    const cells = [...container.querySelectorAll(selectors.cell)];
    let lastClickedElement = null;

    window.addEventListener("click", (e) => {
        let cell = e.target.closest(selectors.cell)

        if (!cell) return;

        const isTargetInner = isTargetFigure?.closest(selectors.cellInner);
        const cellInner = cell.querySelector(selectors.cellInner);
        const figure = cell.querySelector(selectors.figure);

        if (cell.classList.contains(classes.active) || cell.classList.contains(classes.attack)) {
            handlerAnimationFigure(cell, cells);

            // cells.forEach(cell => {
            //     if (isTargetFigure.closest(selectors.cell) !== cell) cell.querySelector(selectors.cellInner).classList.remove(classes.lastMove);
            // });
            //
            // cellInner.classList.add(classes.lastMove);
            // isTargetFigure.closest(selectors.cellInner).classList.add(classes.lastMove);

            setTimeout(() => {
                if (figure) figure.remove();
            }, (speedAnimation / 2));

            setTimeout(() => {
                cellInner.append(isTargetFigure);

                cells.forEach(cell => {
                    handlerFigures(cell.querySelector(selectors.figure), cells, false);
                });

                isCurrentMove = isCurrentMove === 'black' ? 'white' : 'black';
                handlerShahCheckmat();

                if (isBlockedMove) {
                    alert('Messages')
                    blockingMoves(isTargetInner);
                    cellInner.appendChild(figure);
                    isBlockedMove = false;
                    return
                }

                if (figure) {
                    attackedChess.push(figure);
                    addedFiguresIsPopup();
                }

                handlerKingCastling(cell, cells);
                isTargetFigure.classList.remove(classes.firstMove);
            }, speedAnimation);

            listMoves = [];
            listDefenderAndKingPieces = [];

            removeClasses(true);
            return;
        }

        if (lastClickedElement !== cell) {
            removeClasses();

            if (isTargetFigure && isTargetFigure.dataset.type === isCurrentMove) {
                isTargetFigure.closest(selectors.cellInner).classList.add(classes.active);
            }

            lastClickedElement = cell;
        }

        if (isTargetFigure.dataset.type === isCurrentMove) handlerFigures(isTargetFigure, cells, true);
    });
}

function handlerFigures(targetFigure, list, isAddClasses) {
    if (!targetFigure) return;

    const listHandlerFigures = {
        [classesFigure.pawn]: handlerPawn,
        [classesFigure.king]: handlerKing,
        [classesFigure.horse]: handlerHorse,
        [classesFigure.rook]: handleRook,
        [classesFigure.bishop]: handleBishop
    }

    for (let key in classesFigure) {
        const classFigure = classesFigure[key];

        if (targetFigure && targetFigure.classList.contains(classFigure)) {
            listHandlerFigures[classFigure](targetFigure, list, isAddClasses);
            break;
        }
    }
}

// We block a move if there is a threat to the king after it.
function blockingMoves(cellInner, cells) {
    cellInner.appendChild(isTargetFigure);

    isCurrentMove = isTargetFigure.dataset.type;
}

// We process the Pawn
function  handlerPawn(pawn, cells, isAddClasses) {
    const listNotMovesLeft = [0, 8, 16, 24, 32, 40, 48, 56];
    const listNotMovesRight = [7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = handlerDataIndex(pawn);
    const isBlack = pawn.dataset.type === 'black';
    let directions;

    if (isBlack) {
        directions = [
            {dx: 1, dy: -1},
            {dx: 1, dy: 1}
        ];
    } else {
        directions = [
            {dx: -1, dy: 1},
            {dx: -1, dy: -1}
        ];
    }

    for (let i=0; i<directions.length; i++) {
        const dx = directions[i].dx;
        const dy = directions[i].dy;
        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) {
            return
        }

        const nextMoveAttack = cells[nextMoveIndex];
        const nextMoveAttackFigure = nextMoveAttack.querySelector(selectors.figure);
        const forLength = pawn.classList.contains(classes.firstMove) ? 3 : 2;

        if (!handlerAddClasses(listNotMovesLeft, listNotMovesRight, isTargetIndex, nextMoveIndex)) {
            getMoves(pawn, nextMoveAttack);
        }

        if (nextMoveAttack && nextMoveAttackFigure && nextMoveAttackFigure.dataset.type !== isCurrentMove) {
            isAddClasses && nextMoveAttack.classList.add(classes.attack);
        }

        for (let i=1; i<forLength; i++) {
            const isBoardSize = handlerBoardSize(isBlack) * i;
            const nextMove = cells[dataIndex + isBoardSize];

            if (nextMove.querySelector(selectors.figure)) break;

            isAddClasses && nextMove.classList.add(classes.active);
        }
    }
}

// We process the King.
function handlerKing(king, cells, isAddClasses) {
    const notMoveLeft = [0, 8, 16, 24, 32, 40, 48, 56];
    const notMoveRight = [7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = handlerDataIndex(king);
    const directions = [
        {dx: 1, dy: -1}, {dx: 1, dy: 0},
        {dx: 1, dy: 1}, {dx: 0, dy: 1},
        {dx: -1, dy: 1}, {dx: -1, dy: 0},
        {dx: -1, dy: -1}, {dx: 0, dy: -1}
    ];

    directions.forEach(({dx, dy}) => {
        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) return;

        const nextMove = cells[nextMoveIndex];
        const nextMoveFigure = nextMove.querySelector(selectors.figure);
        const classHandlerResult = handlerAddClasses(notMoveLeft, notMoveRight, isTargetIndex, nextMoveIndex);

        if (classHandlerResult) return;

        if (nextMove && nextMoveFigure && nextMoveFigure.dataset.type !== isCurrentMove) {
            isAddClasses && nextMove.classList.add(classes.attack);
            getMoves(king, nextMove);
        }

        if (!nextMoveFigure && !previousListMovesTo.includes(nextMove)) {
            isAddClasses && nextMove.classList.add(classes.active);
            getMoves(king, nextMove);
        }
    });

    // Castling moves.
    if (isAddClasses && king.classList.contains(classes.firstMove)) {
        const directionsCastling = [-1, 1];

        directionsCastling.forEach(direction => {
            for (let i=1; i<4; i++) {
                const nextMoveIndex = dataIndex + (direction * i);
                const nextMoveCastling = cells[nextMoveIndex];
                const figure = nextMoveCastling.querySelector(selectors.figure);

                if (figure) break;

                const figureRook = cells[nextMoveIndex + direction].querySelector(selectors.figure);

                if (figureRook && figureRook.classList.contains(classes.firstMove) && !previousListMovesTo.includes(nextMoveCastling)) {
                    isTargetFigureRook = figureRook;
                    nextMoveCastling.classList.add(classes.active);
                }

                if (notMoveLeft.includes(nextMoveIndex) || notMoveRight.includes(nextMoveIndex)) break;
            }
        });
    }
}

// We process castling.
function handlerKingCastling(cell, cells) {
    const figureKing = cell.querySelector(selectors.figure);

    if (figureKing && figureKing.classList.contains(classesFigure.king) && figureKing.classList.contains(classes.firstMove)) {
        const dataIndex = handlerDataIndex(figureKing);
        const isTargetIndexCastling = isTargetIndex > dataIndex ? -1 : 1;
        const figureRook = cells[dataIndex + isTargetIndexCastling].querySelector(selectors.figure)

        if (figureRook && figureRook.classList.contains(classes.firstMove) && figureRook.classList.contains(classesFigure.rook)) {
            const nextMoveCastlingRookInner = cells[dataIndex - isTargetIndexCastling].querySelector(selectors.cellInner);

            nextMoveCastlingRookInner.appendChild(figureRook);
        }
    }
}

// We process the Horse.
function handlerHorse(horse, cells, isAddClasses) {
    const notMoveLeft = [0, 1, 2, 8, 9, 10, 16, 17, 18, 24, 25, 26, 32, 33, 34, 40, 41, 42, 48, 49, 50, 56, 57, 58];
    const notMoveRight = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 61, 62, 63];
    const dataIndex = handlerDataIndex(horse);
    const directions = [
        { dx: 2, dy: 1 }, { dx: 2, dy: -1 },
        { dx: -2, dy: 1 }, { dx: -2, dy: -1},
        { dx: 1, dy: 2 }, { dx: 1, dy: -2 },
        { dx: -1, dy: 2 }, { dx: -1, dy: -2 }
    ];

    directions.forEach(({dx, dy}) => {
        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) return;
        if (Math.abs((dataIndex % 8) - (nextMoveIndex % 8)) > 2) return;

        const nextMove = cells[nextMoveIndex];
        const nextMoveFigure = nextMove.querySelector(selectors.figure);

        getMoves(horse, horse.closest(selectors.cell));

        if (!nextMoveFigure) {
            const isVectorValid = attackVectorToKing.length === 0 || attackVectorToKing.includes(nextMove);

            if (isVectorValid) {
                isAddClasses && nextMove.classList.add(classes.active);
                getMoves(horse, nextMove);
            }
        } else if (nextMoveFigure.dataset.type !== isCurrentMove) {
            isAddClasses && nextMove.classList.add(classes.attack)
            getMoves(horse, nextMove);
        }
    });
}

// We create a function that checks if the shape has not gone beyond the board, for these cells in this case we do not add classes to move.
function handlerAddClasses(arrLeft, arrRight, targetIndex, moveIndex) {
    return arrLeft.includes(targetIndex) && arrRight.includes(moveIndex) || arrRight.includes(targetIndex) && arrLeft.includes(moveIndex);
}

// We process the Rook.
function handleRook(rook, cells, isAddClasses) {
    const listNotMoves = [[0, 8, 16, 24, 32, 40, 48, 56], [7, 15, 23, 31, 39, 47, 55, 63]];
    // const listNotMoves = [0, 8, 16, 24, 32, 40, 48, 56, 7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = handlerDataIndex(rook);
    const directions = [-1, 1, -8, 8]; // Left, Right, Top, Bottom.

    directions.forEach((direction, index) => {
        getMoves(rook, rook.closest(selectors.cell));
        const notMoves = listNotMoves[index];
        const isNotMoves = notMoves !== undefined;

        for (let i=1; i<8; i++) {
            const nextMoveIndex = dataIndex + (direction * i);
            if (0 > nextMoveIndex || nextMoveIndex >= cells.length) break;

            const nextMove = cells[nextMoveIndex];
            const nextMoveFigure = nextMove.querySelector(selectors.figure);

            if (isNotMoves && notMoves.includes(dataIndex)) break;

            if (isAddClasses) {
                if (!nextMoveFigure) {
                    const isVectorValid = attackVectorToKing.length === 0 || attackVectorToKing.includes(nextMove);

                    if (isVectorValid) {
                        nextMove.classList.add(classes.active);
                    }
                } else {
                    if (nextMoveFigure.dataset.type !== isCurrentMove) {
                        nextMove.classList.add(classes.attack);
                    }

                    break
                }
            } else {
                if (nextMoveFigure && !nextMoveFigure.classList.contains(classesFigure.king)) break;

                // nextMoveFigure && nextMoveFigure.classList.contains(classesFigure.king) && nextMoveFigure.dataset.type !== isCurrentMove

                getMoves(rook, nextMove);
            }

            if (isNotMoves && notMoves.includes(nextMoveIndex)) break
        }
    });
}

// We process the Bishop.
function handleBishop(bishop, cells, isAddClasses) {
    const listNotMovesLeft = [0, 8, 16, 24, 32, 40, 48, 56];
    const listNotMovesRight = [7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = handlerDataIndex(bishop);
    const directions = [
        {dx: 1, dy: -1},
        {dx: 1, dy: 1},
        {dx: -1, dy: -1},
        {dx: -1, dy: 1}
    ]

    directions.forEach(({dx, dy}, index) => {
        getMoves(bishop, bishop.closest(selectors.cell));

        for (let i=1; i<8; i++) {
            const nextMoveIndex = dataIndex + (dx * i * isBoardSize + i * dy);

            if (0 > nextMoveIndex || nextMoveIndex >= cells.length) break;

            const nextMove = cells[nextMoveIndex];
            const nextMoveFigure = nextMove.querySelector(selectors.figure);

            if (handlerAddClasses(listNotMovesLeft, listNotMovesRight, dataIndex, nextMoveIndex)) break;
            // if (listNotMovesLeft.includes(dataIndex) && listNotMovesRight.includes(nextMoveIndex) || listNotMovesRight.includes(dataIndex) && listNotMovesLeft.includes(nextMoveIndex)) break;

            if (isAddClasses) {
                if (!nextMoveFigure) {
                    const isVectorValid = attackVectorToKing.length === 0 || attackVectorToKing.includes(nextMove);

                    if (isVectorValid) {
                        nextMove.classList.add(classes.active);
                    }
                } else {
                    if (nextMoveFigure.dataset.type !== isCurrentMove) {
                        nextMove.classList.add(classes.attack);
                    }

                    break
                }
            } else {
                if (nextMoveFigure && !nextMoveFigure.classList.contains(classesFigure.king)) break;

                getMoves(bishop, nextMove);
            }

            // if ((nextMoveIndex % 8 === 0 && dy === -1) || (nextMoveIndex % 8 === 7 && dy === 1)) break;
            if (listNotMovesLeft.includes(nextMoveIndex) || listNotMovesRight.includes(nextMoveIndex)) break;
        }
    });
}

// We get all the moves of the current chess side.
function getMoves(fromFigure, cell) {
    const capture = {
        from: fromFigure,
        to: cell
    }

    listMoves.push(capture);
}

// We process moves when the king is in danger.
function handlerShahCheckmat() {
    if (listMoves.length <= 0) return;

    const currentListMoves = listMoves.filter(move => move.from.dataset.type === isCurrentMove);
    const previousListMoves = listMoves.filter(move => move.from.dataset.type !== isCurrentMove);
    // listDefenderAndKingPieces = [];
    attackVectorToKing = [];

    if (currentListMoves.length === 0 || previousListMoves.length === 0) return;

    handlerAttackVectorToKing(previousListMoves);

    handlerListDefenderAndKingPieces(currentListMoves, previousListMoves);
}

// We get the direction of the pieces' moves to the king into an array.
function handlerAttackVectorToKing(previousList) {
    previousList.forEach((previousMove, index, arr) => {
        const elKing = previousMove.to.querySelector(`.${classesFigure.king}`);

        if (elKing && elKing.dataset.type === isCurrentMove) {
            let attackVector = [];

            for (let j=1; j<=8; j++) {
                if (arr[index - j].to.querySelector(selectors.figure) !== previousMove.from) {
                    attackVector.push(arr[index - j].to);
                } else {
                    break;
                }
            }

            attackVectorToKing.push(...attackVector);
        }
    });
}

// We get pieces in an array that can move in shah.
function handlerListDefenderAndKingPieces(currentList, previousList) {
    previousList.forEach(previousMove => {
        const figure = previousMove.to.querySelector(selectors.figure);
        let king;
        let previousFrom;

        if (figure && figure.classList.contains(classesFigure.king) && figure.dataset.type === isCurrentMove) {
            king = previousMove.to;
            previousFrom = previousMove.from;

            king.classList.add(classes.shah);
            listDefenderAndKingPieces.push(king);
        }

        currentList.forEach(currentMove => {
            const figure = currentMove.to.querySelector(selectors.figure);

            if (figure === previousFrom || attackVectorToKing.includes(currentMove.to)) {
                listDefenderAndKingPieces.push(currentMove.from.closest(selectors.cell));
            }
        });
    });

    isBlockedMove = currentList.some(currentMove => {
        const figure = currentMove.to.querySelector(selectors.figure);

        return figure && figure.classList.contains(classesFigure.king) && figure.dataset.type !== isCurrentMove
    });

    // console.log(isCurrentMove)
    if (!isBlockedMove) {
        previousListMovesTo = previousList.map(({_, to}) => to);
        currentListMovesTo = currentList.map(({_, to}) => to);
        listDefenderAndKingPieces = [...new Set(listDefenderAndKingPieces)];
    }
}

// We get the index of the cell on which the figure is located.
function handlerDataIndex(element) {
    if (element.classList.contains(classes.figure)) {
        return +element.closest(selectors.cell).dataset.index;
    } else {
        return +element.dataset.index;
    }
}

// Add the attacked figures to the appropriate pop-up window, where they will be saved.
function addedFiguresIsPopup() {
    const popups = container.querySelectorAll(selectors.popup);

    if (popups.length > 0) {
        attackedChess.forEach(figure => {
            popups.forEach(popup => {
                if (popup.dataset.popupType === figure.dataset.type) {
                    popup.appendChild(figure);
                }
            });
        });
    }
}

// We delete the classes for the move.
function removeClasses(removeShah) {
    const cells = [...container.querySelectorAll(selectors.cell)];

    cells.forEach(cell => {
        const cellInner = cell.querySelector(selectors.cellInner);

        cellInner.classList.remove(classes.active);
        cell.classList.remove(classes.active);
        cell.classList.remove(classes.attack);

        if (cell.classList.contains(classes.shah) && removeShah) {
            cell.classList.remove(classes.shah);
        }
    });
}

// Adding animation for figures when moving.
function handlerAnimationFigure(cellMove, listCell) {
    const checkersWrapperRect = container.querySelector(selectors.checkersWrapper).getBoundingClientRect();
    const cellMoveRect = cellMove.getBoundingClientRect();
    const isTargetFigureRect = isTargetFigure.getBoundingClientRect();

    const translateY = (cellMoveRect.top - checkersWrapperRect.top) - (isTargetFigureRect.top - checkersWrapperRect.top);
    const translateX = (cellMoveRect.left - checkersWrapperRect.left) - (isTargetFigureRect.left - checkersWrapperRect.left);

    const dataIndex = handlerDataIndex(cellMove);
    const isTargetAhead  = isTargetIndex > dataIndex;
    const cellRock = listCell[+cellMove.dataset.index + (isTargetAhead ? -1 : 1)];
    const figureRook = cellRock?.querySelector(selectors.figure);

    isTargetFigure.style.transform = `translate(${translateX}px, ${translateY}px)`;

    // Adding animation for castling.
    if (isTargetFigure.classList.contains(classesFigure.king) &&
        isTargetFigure.classList.contains(classes.firstMove) &&
        figureRook &&
        figureRook.classList.contains(classesFigure.rook) &&
        figureRook.classList.contains(classes.firstMove)
    ) {
        const figureRookTranslateX = isTargetAhead ? '218%' : '-218%';

        figureRook.style.transform = `translateX(${figureRookTranslateX})`;
    }

    setTimeout(() => {
        isTargetFigure.removeAttribute('style');
        figureRook?.removeAttribute('style');
    }, speedAnimation);
}