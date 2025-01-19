"use strict"

const selectors = {
    container: '.js-container',
    checkersWrapper: '.js-checkers',
    cell: '.js-checkers-cell',
    cellInner: '.js-checkers-cell-inner',
    figure: '.js-cell-figure'
}

const classes = {
    active: 'is-active',
    black: 'is-black',
    attack: 'is-attack',
    firstMove: 'is-first-move',
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

let listMoves = [];
let currentListMoves = [];
let previousListMoves = [];
let defendersAndKingListMoves = [];
let isBoardSize = handlerBoardSize(true);
let isTargetFigure = null;
let isTargetIndex = 0;
let currentMove = 'black';

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

            cell.classList.add('checkers__cell')
            cell.classList.add('js-checkers-cell')
            cellInner.classList.add('checkers__cell-inner')
            cellInner.classList.add('js-checkers-cell-inner')

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
            // cellInner.append(figure);
        } else if (index === 3 || index === 60) {
            cellInner.append(figure);
        } else if (index === 1 || index === 6 || index === 57 || index === 62) {
            // cellInner.append(figure);
        } else if (index === 0 || index === 7 || index === 56 || index === 63) {
            cellInner.append(figure);
        } else if (index === 2 || index === 5 || index === 58 || index === 61) {
            // cellInner.append(figure);
        }

        if (index > 7 && index <= 15) {
            // addElementClassesWithAttributes(figure, classes.pawn, true, "black", "♟");
        } else if (index > 47 && index <= 55) {
            // addElementClassesWithAttributes(figure, classes.pawn, true, "white", "♙");
        } else if (index === 3) {
            addElementClassesWithAttributes(figure, classesFigure.king, true, "black", "♚");
        } else if (index === 60) {
            addElementClassesWithAttributes(figure, classesFigure.king, true, "white", "♔");
        } else if (index === 1|| index === 6) {
            // addElementClassesWithAttributes(figure, classesFigure.horse, false, "black", "♞");
        } else if (index === 57  || index === 62) {
            // addElementClassesWithAttributes(figure, classesFigure.horse, false, "white", "♘");
        } else if (index === 0 || index === 7) {
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

            if (defendersAndKingListMoves.length > 0) {
                if (defendersAndKingListMoves.includes(cell)) {
                    cell = this.closest(selectors.cell);
                } else {
                    return;
                }
            }

            if (cell && !cell.classList.contains(classes.attack)) {
                isTargetFigure = this;
                isTargetIndex = +cell.dataset.index;
            }
        });

        handlerFigures(figure, cells);
    });
}

function handlerClickFigureOnMove() {
    const cells = [...container.querySelectorAll(selectors.cell)];
    let lastClickedElement = null;

    window.addEventListener("click", (e) => {
        // console.log(e.target.classList.contains('js-cell-figure'));
        let cell = e.target.closest(selectors.cell)

        // console.log(cell)
        if (!cell) return;

        const cellInner = cell.querySelector(selectors.cellInner);
        const figure = cell.querySelector(selectors.figure);

        if (cell.classList.contains(classes.active) || cell.classList.contains(classes.attack)) {
            setTimeout(() => {
                handlerKingCastling(cell, cells);
            }, 0);

            if (figure) figure.remove();

            setTimeout(() => {
                isTargetFigure.classList.remove(classes.firstMove)
            }, 0);

            cellInner.append(isTargetFigure);
            listMoves = [];
            cells.forEach(cell => handlerFigures(cell.querySelector(selectors.figure), cells, false));

            currentMove = currentMove === 'black' ? 'white' : 'black';

            removeClasses(true);
            cells.forEach(cell => handlerFigures(cell.querySelector(selectors.figure), cells, false));
            handlerShahCheckmat();
            return;
        }

        if (lastClickedElement !== cell) {
            removeClasses();
            lastClickedElement = cell;
        }

        handlerFigures(isTargetFigure, cells, true);
    });
}

function handlerFigures(targetFigure, list, isAddClasses) {
    if (targetFigure && currentMove === targetFigure.dataset.type) {
        const listHandlerFigures = {
            [classesFigure.pawn]: handlerPawn,
            [classesFigure.king]: handlerKing,
            [classesFigure.horse]: handlerHorse,
            [classesFigure.rook]: handleRook,
            [classesFigure.bishop]: handleBishop
        }

        for (let key in classesFigure) {
            const classFigure = classesFigure[key];

            if (targetFigure.classList.contains(classFigure)) {
                listHandlerFigures[classFigure](targetFigure, list, isAddClasses);
                break;
            }
        }
    }
}

// We process the Pawn
function  handlerPawn(pawn, cells, isAddClasses) {
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

        if (nextMoveAttack && nextMoveAttackFigure && nextMoveAttackFigure.dataset.type !== currentMove) {
            isAddClasses && nextMoveAttack.classList.add(classes.attack);
            getMoves(pawn, nextMoveAttack);
        }

        for (let i=1; i<forLength; i++) {
            const isBoardSize = handlerBoardSize(isBlack) * i;
            const nextMove = cells[dataIndex + isBoardSize];

            if (nextMove.querySelector(selectors.figure)) break;

            isAddClasses && nextMove.classList.add(classes.active);
            getMoves(pawn, nextMove);
        }
    }
}

// We process the King.
function handlerKing(king, cells, isAddClasses) {
    const notMoveLeft = [0, 8, 16, 24, 32, 40, 48, 56];
    const notMoveRight = [7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = handlerDataIndex(king);
    const previousListMovesTo = previousListMoves.map(({_, to}) => to);
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

        if (nextMove && nextMoveFigure && nextMoveFigure.dataset.type !== currentMove) {
            isAddClasses && nextMove.classList.add(classes.attack);
            getMoves(king, nextMove);
        }

        if (!nextMoveFigure && !previousListMovesTo.includes(nextMove)) {
            isAddClasses && nextMove.classList.add(classes.active);
            getMoves(king, nextMove);
        }
    });

    if (isAddClasses) {
        const directionsCastling = [-1, 1];

        directionsCastling.forEach(direction => {
            for (let i=1; i<4; i++) {
                const nextMoveIndex = dataIndex + (direction * i);
                const nextMoveCastling = cells[nextMoveIndex];
                const figure = nextMoveCastling.querySelector(selectors.figure);

                if (figure) break;

                const figureRook = cells[nextMoveIndex + direction].querySelector(selectors.figure);
                // const nextMoveCastlingRook = cells[nextMoveIndex - direction];

                if (figureRook && figureRook.classList.contains(classes.firstMove)) {
                    nextMoveCastling.classList.add(classes.active);
                    // console.log(nextMoveCastlingRook);
                }

                if (notMoveLeft.includes(nextMoveIndex) || notMoveRight.includes(nextMoveIndex)) break;
            }
        });
    }
}

function handlerKingCastling(cell, cells) {
    const figure = cell.querySelector(selectors.figure);

    if (figure && figure.classList.contains(classesFigure.king) && figure.classList.contains(classes.firstMove)) {
        const dataIndex = handlerDataIndex(figure);
        const isTargetIndexCastling = isTargetIndex > dataIndex ? -1 : 1;
        const figureRook = cells[dataIndex + isTargetIndexCastling].querySelector(selectors.figure);

        if (figureRook.classList.contains(classes.firstMove)) {
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
        // console.log(cells[dataIndex + (1 * (8 * 2) + 1)])
        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) return;

        const nextMove = cells[nextMoveIndex];
        const nextMoveFigure = nextMove.querySelector(selectors.figure);
        const classHandlerResult = handlerAddClasses(notMoveLeft, notMoveRight, isTargetIndex, nextMoveIndex);

        if (classHandlerResult) return;

        if (!nextMoveFigure) {
            isAddClasses && nextMove.classList.add(classes.active);
            getMoves(horse, nextMove);
        } else if (nextMoveFigure.dataset.type !== currentMove) {
            isAddClasses && nextMove.classList.add(classes.attack);
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
                    nextMove.classList.add(classes.active);
                } else {
                    if (nextMoveFigure.dataset.type !== currentMove) {
                        nextMove.classList.add(classes.attack);
                    }

                    break
                }
            } else {
                getMoves(rook, nextMove);
            }

            if (isNotMoves && notMoves.includes(nextMoveIndex)) break
        }
    });
}

// We process the Round.
function handleBishop(bishop, cells, isAddClasses) {
    const listNotMoves = [0, 8, 16, 24, 32, 40, 48, 56, 7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = handlerDataIndex(bishop);
    const directions = [
        {dx: 1, dy: -1},
        {dx: 1, dy: 1},
        {dx: -1, dy: -1},
        {dx: -1, dy: 1}
    ]

    directions.forEach(({dx, dy}, index) => {
        for (let i=1; i<8; i++) {
            const nextMoveIndex = dataIndex + (dx * i * isBoardSize + i * dy);

            if (0 > nextMoveIndex || nextMoveIndex >= cells.length) break;

            const nextMove = cells[nextMoveIndex];
            const nextMoveFigure = nextMove.querySelector(selectors.figure);

            if (listNotMoves.includes(dataIndex)) break;

            if (isAddClasses) {
                if (!nextMoveFigure) {
                    nextMove.classList.add(classes.active);
                } else {
                    if (nextMoveFigure.dataset.type !== currentMove) {
                        nextMove.classList.add(classes.attack);
                    }

                    break
                }
            } else {
                getMoves(bishop, nextMove);
            }


            if (listNotMoves.includes(nextMoveIndex)) break
        }
    });
}

// We get all the moves of the current chess side.
function getMoves(fromFigure, cell) {
    if (!listMoves.includes(cell)) {
        const capture = {
            from: fromFigure,
            to: cell
        }

        listMoves.push(capture);
    }
}

// We process moves when the king is in danger.
function handlerShahCheckmat() {
    if (listMoves.length <= 0) return;

    currentListMoves = [];
    previousListMoves = [];
    defendersAndKingListMoves = [];

    listMoves.forEach(move => {
        if (move.from.dataset.type === currentMove) {
            currentListMoves.push(move)
        } else {
            previousListMoves.push(move)
        }
    });

    if (previousListMoves.length > 0 && currentListMoves.length > 0) {
        previousListMoves.forEach(previousMove => {
            const figure = previousMove.to.querySelector(selectors.figure);
            let previousFrom;

            if (figure && figure.classList.contains(classesFigure.king) && figure.dataset.type === currentMove) {
                const king = previousMove.to;
                previousFrom = previousMove.from;

                king.classList.add(classes.shah);
                defendersAndKingListMoves.push(king);
            }

            currentListMoves.forEach(currentMove => {
                const figure = currentMove.to.querySelector(selectors.figure);

                if (figure === previousFrom) {
                    defendersAndKingListMoves.push(currentMove.from.closest(selectors.cell));
                }
            });
        });
    }
}
// We get the index of the cell on which the figure is located.
function handlerDataIndex(figure) {
    return +figure.closest(selectors.cell).dataset.index;
}

// We delete the classes for the move.
function removeClasses(removeShah) {
    const cells = [...container.querySelectorAll(selectors.cell)];

    cells.forEach(cell => {
        if (cell.classList.contains(classes.active)) {
            cell.classList.remove(classes.active);
        }

        if (cell.classList.contains(classes.attack)) {
            cell.classList.remove(classes.attack);
        }

        if (cell.classList.contains(classes.shah) && removeShah) {
            cell.classList.remove(classes.shah);
        }
    });
}