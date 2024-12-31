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
    pawn: 'is-pawn',
    king: 'is-king',
    horse: 'is-horse',
    round: 'is-round',
    attack: 'is-attack',
    firstMove: 'is-first-move'
}

function handlerBoardSize(isBlack = false) {
    return isBlack ? 8 : -8;
}

const container = document.querySelector(selectors.container);
let isBoardSize = handlerBoardSize();
let isTargetFigure = null;
let isTargetIndex = 0;
let currentMove = 'black';

function createBoard() {
    if (!container) {
        return
    }

    const checkersWrapper = container.querySelector(selectors.checkersWrapper);
    const cells = container.querySelectorAll(selectors.cell);
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
    const cellInners = wrapper.querySelectorAll(selectors.cellInner);

    if (cellInners.length < 1) {
        return
    }

    cellInners.forEach((cellInner, index) => {
        const figure = document.createElement('div');

        cellInner.closest(selectors.cell).setAttribute('data-index', index);
        figure.classList.add('checkers__cell-figure');
        figure.classList.add('js-cell-figure');

        if (index > 7 && index <= 15 || index > 47 && index <= 55) {
            cellInner.append(figure)
        } else if (index === 3) {
            cellInner.append(figure)
        } else if (index === 60) {
            cellInner.append(figure)
        } else if (index === 57 || index === 62) {
            cellInner.append(figure)
        } else if (index === 1 || index === 6) {
            cellInner.append(figure)
        } else if (index === 0 || index === 7) {
            cellInner.append(figure)
        } else if (index === 55 || index === 63) {
            cellInner.append(figure)
        }

        if (index > 7 && index <= 15) {
            addElementClassesWithAttributes(figure, classes.pawn, classes.firstMove, "black", "♟");
        } else if (index > 47 && index <= 55) {
            addElementClassesWithAttributes(figure, classes.pawn, classes.firstMove, "white", "♙");
        } else if (index === 3) {
            addElementClassesWithAttributes(figure, classes.king, classes.firstMove, "black", "♛");
        } else if (index === 60) {
            addElementClassesWithAttributes(figure, classes.king, classes.firstMove, "white", "♕");
        } else if (index === 1|| index === 6) {
            addElementClassesWithAttributes(figure, classes.horse, classes.firstMove, "black", "♞");
        } else if (index === 57  || index === 62) {
            addElementClassesWithAttributes(figure, classes.horse, classes.firstMove, "white", "♘");
        } else if (index === 0  || index === 7) {
            addElementClassesWithAttributes(figure, classes.round, classes.firstMove, "black", "♜");
        } else if (index === 55  || index === 63) {
            addElementClassesWithAttributes(figure, classes.round, classes.firstMove, "white", "♖");
        }
    });
}

// A function that adds the desired figure and class with data attributes for the figure element.
function addElementClassesWithAttributes(element, cls, clsFirstMove, dataType, figure) {
    element.classList.add(cls);
    element.classList.add(clsFirstMove);
    element.setAttribute('data-type', dataType);
    element.innerHTML = figure;
}

function handlerClickFigure() {
    const figures = [...container.querySelectorAll(selectors.figure)];

    if (figures.length < 1) {
        return
    }

    figures.forEach(figure => {
        figure.addEventListener('click', function () {
            const cell = this.closest(selectors.cell);

            if (cell && !cell.classList.contains(classes.attack)) {
                isTargetFigure = this;
                isTargetIndex = +cell.dataset.index;
            }
        });
    });
}

function handlerClickFigureOnMove() {
    const cells = [...container.querySelectorAll(selectors.cell)];
    window.addEventListener("click", (e) => {
        const cell = e.target.closest(selectors.cell);

        if (!cell) return

        const cellInner = cell.querySelector(selectors.cellInner);
        const figure = cell.querySelector(selectors.figure);

        if (cell.classList.contains(classes.active) || cell.classList.contains(classes.attack)) {
            if (figure) figure.remove();

            isTargetFigure.classList.remove(classes.firstMove);
            cellInner.append(isTargetFigure);

            currentMove = currentMove === 'black' ? 'white' : 'black';
            removeClasses();
            return;
        }

        removeClasses();

        if (isTargetFigure && currentMove === isTargetFigure.dataset.type) {
            if (isTargetFigure.classList.contains(classes.pawn)) {
                handlerPawn(isTargetFigure, cells);
            } else if (isTargetFigure.classList.contains(classes.king)) {
                handlerKing(isTargetFigure, cells);
            } else if (isTargetFigure.classList.contains(classes.horse)) {
                handlerHorse(isTargetFigure, cells);
            } else if (isTargetFigure.classList.contains(classes.round)) {
                handleRound(isTargetFigure, cells)
            }
        }
    });
}

// We process the Pawn
function  handlerPawn(pawn, cells) {
    const dataIndex = +pawn.closest(selectors.cell).dataset.index;
    const isBlack = pawn.dataset.type === 'black';
    let directions;

    if (isBlack) {
        directions = [
            {dx: -1, dy: 1},
            {dx: -1, dy: -1}
        ];
    } else {
        directions = [
            {dx: 1, dy: -1},
            {dx: 1, dy: 1}
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
            nextMoveAttack.classList.add(classes.attack);
        }

        for (let i=1; i<forLength; i++) {
            const isBoardSize = handlerBoardSize(isBlack) * i;
            const nextMove = cells[dataIndex + isBoardSize];

            if (nextMove.querySelector(selectors.figure)) break;

            nextMove.classList.add(classes.active);
        }
    }
}

// We process the King.
function handlerKing(king, cells) {
    const notMoveLeft = [0, 8, 16, 24, 32, 40, 48, 56];
    const notMoveRight = [7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = +king.closest(selectors.cell).dataset.index;
    const directions = [
        {dx: 1, dy: -1},
        {dx: 1, dy: 0},
        {dx: 1, dy: 1},
        {dx: 0, dy: 1},
        {dx: -1, dy: 1},
        {dx: -1, dy: 0},
        {dx: -1, dy: -1},
        {dx: 0, dy: -1}
    ];

    directions.forEach(direction => {
        const dx = direction.dx;
        const dy = direction.dy;
        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) {
            return
        }

        const nextMove = cells[nextMoveIndex];
        const nextMoveFigure = nextMove.querySelector(selectors.figure);
        const isAddClasses = handlerAddClasses(notMoveLeft, notMoveRight, isTargetIndex, nextMoveIndex);

        if (nextMove && nextMoveFigure && nextMoveFigure.dataset.type !== currentMove && isAddClasses) {
            nextMove.classList.add(classes.attack);
        }

        if (!nextMoveFigure && isAddClasses) {
             nextMove.classList.add(classes.active);
        }
    });
}

// We process the Horse.
function handlerHorse(horse, cells) {
    const notMoveLeft = [0, 1, 2, 8, 9, 10, 16, 17, 18, 24, 25, 26, 32, 33, 34, 40, 41, 42, 48, 49, 50, 56, 57, 58];
    const notMoveRight = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 61, 62, 63];
    const dataIndex = +horse.closest(selectors.cell).dataset.index;
    const directions = [
        {dx: -1, dy: 1},
        {dx: -1, dy: -1},
        {dx: 1, dy: -1},
        {dx: 1, dy: 1},
        {dx: 0, dy: -10},
        {dx: 0, dy: 10},
        {dx: 0, dy: -6},
        {dx: 0, dy: 6}
    ];

    directions.forEach(direction => {
        const dx = direction.dx;
        const dy = direction.dy;
        const nextMoveIndex = dataIndex + (dx * (isBoardSize * 2) + dy);

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) {
            return
        }

        const nextMove = cells[nextMoveIndex];
        const nextMoveFigure = nextMove.querySelector(selectors.figure);
        const isAddClasses = handlerAddClasses(notMoveLeft, notMoveRight, isTargetIndex, nextMoveIndex);

        if (!nextMoveFigure) {
            isAddClasses && nextMove.classList.add(classes.active);
        } else {
            if (nextMoveFigure.dataset.type !== currentMove) {
                isAddClasses && nextMove.classList.add(classes.attack);
            }
        }
    });
}

// We process the Round.
function handleRound(round, cells) {
    console.log(round)
}

// We create a function that checks if the shape has not gone beyond the board, for these cells in this case we do not add classes to move.
function handlerAddClasses(arrLeft, arrRight, targetIndex, moveIndex) {
    return !(arrLeft.includes(targetIndex) && arrRight.includes(moveIndex) || arrRight.includes(targetIndex) && arrLeft.includes(moveIndex));
}

// We delete the classes for the move.
function removeClasses() {
    const cells = [...container.querySelectorAll(selectors.cell)];

    cells.forEach(cell => {
        if (cell.classList.contains(classes.active)) {
            cell.classList.remove(classes.active);
        }
        if (cell.classList.contains(classes.attack)) {
            cell.classList.remove(classes.attack);
        }
    });
}