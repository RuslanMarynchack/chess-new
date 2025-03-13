"use strict"

const selectors = {
    container: '.js-container',
    checkersWrapper: '.js-checkers',
    cell: '.js-checkers-cell',
    cellInner: '.js-checkers-cell-inner',
    cellInnerLastMove: '.js-checkers-cell-inner.is-last-move',
    figure: '.js-cell-figure',
    figurePawn: '.js-cell-figure.is-pawn',
    popup: '.js-popup',
    popupClose: '.js-popup-close'
}

const classes = {
    checkersWrapper: 'js-checkers',
    figure: 'js-cell-figure',
    active: 'is-active',
    black: 'is-black',
    attack: 'is-attack',
    firstMove: 'is-first-move',
    lastMove: 'is-last-move',
    shah: 'is-shah',
    enPassant: 'is-en-passant',
    stopGame: 'is-stop-game'
}

const classesFigure = {
    pawn: 'is-pawn',
    king: 'is-king',
    horse: 'is-horse',
    rook: 'is-rook',
    bishop: 'is-bishop',
    queen: 'is-queen'
}

function handlerBoardSize(isBlack = false) {
    return isBlack ? 8 : -8;
}

const container = document.querySelector(selectors.container);
const checkersWrapper = container.querySelector(selectors.checkersWrapper);
const speedAnimation = 700;
const directionsLeftRight = [-1, 1];

let listMoves = [];
let listAttackPawn = [];
let attackVectorToKing = [];
let previousListMovesTo = [];
let listDefenderAndKingPieces = [];
let isBoardSize = handlerBoardSize(true);
let isTargetFigure = null;
let isTargetInner = null;
let isTargetFigureRook = null;
let isTargetIndex = 0;
let isBlockedMove = false;
let isCurrentMove = 'black';

function createBoard() {
    if (!container) {
        return
    }

    let isBlackCell = false;

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

    arrangeFigures();
    handlerClickFigure();
    handlerClickFigureOnMove();
}

createBoard();

function arrangeFigures() {
    const cellInners = [...checkersWrapper.querySelectorAll(selectors.cellInner)];

    if (cellInners.length < 1) return;

    cellInners.forEach((cellInner, index) => {
        const figure = document.createElement('div');

        cellInner.closest(selectors.cell).setAttribute('data-index', index);
        figure.classList.add('checkers__cell-figure', 'js-cell-figure');

        if (index > 40 && index <= 42 || index > 21 && index <= 23) {
            cellInner.append(figure);
        } else if (index === 3 || index === 59) {
            cellInner.append(figure);
        } else if (index === 1 || index === 6 || index === 57 || index === 62) {
            // cellInner.append(figure);
        } else if (index === 0 || index === 19 || index === 56 || index === 63) {
            cellInner.append(figure);
        } else if (index === 2 || index === 5 || index === 58 || index === 61) {
            cellInner.append(figure);
        } else if (index === 4 || index === 60) {
            // cellInner.append(figure);
        }

        if (index > 40 && index <= 42) {
            addElementClassesWithAttributes(figure, classesFigure.pawn, true, "black", "♟");
        } else if (index > 21 && index <= 23) {
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
            addElementClassesWithAttributes(figure, classesFigure.bishop, false, "black", "♝");
        } else if (index === 58 || index === 61) {
            addElementClassesWithAttributes(figure, classesFigure.bishop, false, "white", "♗");
        } else if (index === 4) {
            addElementClassesWithAttributes(figure, classesFigure.queen, false, "black", "♛");
        } else if (index === 60) {
            addElementClassesWithAttributes(figure, classesFigure.queen, false, "white", "♕");
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

function handlerFigureCurrentMove(figure) {
    return figure?.dataset.type === isCurrentMove
}

function handlerClickFigureOnMove() {
    const cells = [...checkersWrapper.querySelectorAll(selectors.cell)];
    let lastClickedElement = null;

    window.addEventListener("click", (e) => {
        let isClassFirstMove = false;
        let cell = e.target.closest(selectors.cell);

        addedFiguresIsPopup(e.target);
        handlerPawnTransformation(e.target);

        if (!cell) {
            return;
        }

        const figure = cell.querySelector(selectors.figure);

        handlerClickFigure(cell, figure);

        if (!isTargetFigure) return;

        const cellInner = cell.querySelector(selectors.cellInner);
        const isPawnBoardSize = handlerBoardSize(isCurrentMove !== 'black');

        if (cell.classList.contains(classes.active) || cell.classList.contains(classes.attack)) {
            checkersWrapper.classList.add(classes.stopGame);
            handlerAnimationFigure(cell, cells);

            const cellsInnerLastMove = [...checkersWrapper.querySelectorAll(selectors.cellInnerLastMove)];

            removeClasses([classes.lastMove]);

            cellInner.classList.add(classes.lastMove);
            isTargetFigure.closest(selectors.cellInner).classList.add(classes.lastMove);

            setTimeout(() => {
                if (figure) {
                    figure.remove();
                } else if (isTargetFigure.classList.contains(classes.enPassant)) {
                    const dataIndex = handlerDataIndex(cell);
                    const enPassantRemoveFigure = cells[isPawnBoardSize + dataIndex].querySelector(selectors.figure);

                    enPassantRemoveFigure.remove();
                }
            }, (speedAnimation / 2));

            setTimeout(() => {
                cellInner.append(isTargetFigure);

                if (isTargetFigure.classList.contains(classesFigure.pawn)) {
                    handlerPawnTransformationPopup(isTargetFigure);
                }

                handlerKingCastling(cell, cells);

                cells.forEach(cell => {
                    handlerFigures(cell.querySelector(selectors.figure), cells, false);
                });

                if (isTargetFigure.classList.contains(classes.firstMove)) {
                    removeClasses([classes.firstMove]);
                    isClassFirstMove = true;
                }

                isCurrentMove = isCurrentMove === 'black' ? 'white' : 'black';
                removeClasses([classes.shah]);
                handlerShahCheckmat();

                checkersWrapper.classList.remove(classes.stopGame);

                // We block a move if there is a threat to the king after it.
                if (isBlockedMove) {
                    handlerOpenPopup("popup-blocked-move")
                    // alert('This measure cannot be performed if the king is in check after this move.');
                    isTargetInner.appendChild(isTargetFigure);
                    isClassFirstMove && isTargetFigure.classList.add(classes.firstMove);

                    removeClasses([classes.lastMove]);

                    if (cellsInnerLastMove.length > 0) cellsInnerLastMove.forEach(cellInner => cellInner.classList.add(classes.lastMove));
                    isCurrentMove = isTargetFigure.dataset.type;

                    figure && cellInner.appendChild(figure);
                    isBlockedMove = false;

                    return
                }

                // removeClasses([classes.enPassant]);

            }, speedAnimation);

            listMoves = [];
            listAttackPawn = [];
            listDefenderAndKingPieces = [];

            removeClasses([classes.active, classes.attack]);
            return;
        }

        if (lastClickedElement !== cell) {
            removeClasses([classes.active, classes.attack]);

            if (handlerFigureCurrentMove(isTargetFigure)) {
                isTargetFigure.closest(selectors.cellInner).classList.add(classes.active);
            }

            lastClickedElement = cell;
        }

        if (isTargetFigure.closest(selectors.checkersWrapper) && handlerFigureCurrentMove(isTargetFigure)) {
            handlerFigures(isTargetFigure, cells, true);
        }
    });
}

function handlerClickFigure(cellEl, figureEl) {
    // const cells = [...checkersWrapper.querySelectorAll(selectors.cell)];
    //
    // if (cells.length < 1) return;
    //
    // cells.forEach(cell => {
    //     const figure = cell.querySelector(selectors.figure);
    //
    //     if (!figure) return;
    //
    //     figure.addEventListener('click', function () {
    //
    //     });
    // });
    console.log(listDefenderAndKingPieces)
    if (listDefenderAndKingPieces.length > 0) {
        const figure = cellEl.querySelector(selectors.figure);

        if (listDefenderAndKingPieces.includes(cellEl) || figure?.classList.contains(classesFigure.king)) {
            cellEl = figure.closest(selectors.cell);
        } else {
            return;
        }
    }

    if (!cellEl?.classList.contains(classes.attack) && handlerFigureCurrentMove(figureEl)) {
        isTargetFigure = figureEl;
        isTargetInner = isTargetFigure.closest(selectors.cellInner);
        isTargetIndex = +cellEl.dataset.index;
    }
}

function handlerFigures(targetFigure, list, isAddClasses) {
    if (!targetFigure) return;

    const listHandlerFigures = {
        [classesFigure.pawn]: handlerPawn,
        [classesFigure.king]: handlerKing,
        [classesFigure.horse]: handlerHorse,
        [classesFigure.rook]: handleQueenBishopRookMoves,
        [classesFigure.bishop]: handleQueenBishopRookMoves,
        [classesFigure.queen]: handleQueenBishopRookMoves
    }

    for (let key in classesFigure) {
        const classFigure = classesFigure[key];

        if (targetFigure && targetFigure.classList.contains(classFigure)) {
            listHandlerFigures[classFigure](targetFigure, list, isAddClasses);
            break;
        }
    }
}

// We process the Pawn
function handlerPawn(pawn, cells, isAddClasses) {
    const listNotMovesLeft = [0, 8, 16, 24, 32, 40, 48, 56];
    const listNotMovesRight = [7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = handlerDataIndex(pawn);
    const isBlack = pawn.dataset.type === 'black';
    const forLength = pawn.classList.contains(classes.firstMove) ? 3 : 2;
    const isPawnBoardSize = handlerBoardSize(isCurrentMove === 'black');
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

    if (!handlerFigureCurrentMove(pawn) || (isTargetFigure === pawn && pawn.classList.contains(classes.enPassant))) {
        directionsLeftRight.forEach(number => {
            const directionFigure = cells[number + dataIndex].querySelector(selectors.figure);

            if (directionFigure) {
                if (directionFigure.classList.contains(classes.firstMove) && handlerFigureCurrentMove(directionFigure)) {
                    pawn.classList.add(classes.enPassant);
                }

                if (isTargetFigure === pawn && directionFigure.closest(selectors.cellInner).classList.contains(classes.lastMove) && pawn.classList.contains(classes.enPassant)) {
                    cells[isPawnBoardSize + (number + dataIndex)].classList.add(classes.attack);
                }
            }
        });
    }

    for (let i=0; i<directions.length; i++) {
        getMoves(pawn, pawn.closest(selectors.cell));

        const dx = directions[i].dx;
        const dy = directions[i].dy;
        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) {
            return
        }

        const nextMoveAttack = cells[nextMoveIndex];
        const nextMoveAttackFigure = nextMoveAttack.querySelector(selectors.figure);

        // console.log(!handlerAddClasses(listNotMovesLeft, listNotMovesRight, isTargetIndex, nextMoveIndex), nextMoveAttack)
        if (!nextMoveAttackFigure && !handlerAddClasses(listNotMovesLeft, listNotMovesRight, dataIndex, nextMoveIndex)) {
            listAttackPawn.push({
                from: pawn,
                to: nextMoveAttack
            });
        }

        if (nextMoveAttack && nextMoveAttackFigure && !handlerFigureCurrentMove(nextMoveAttackFigure)) {
            isAddClasses && nextMoveAttack.classList.add(classes.attack);
        }
    }

    for (let i=1; i<forLength; i++) {
        const isBoardSize = handlerBoardSize(isBlack) * i;
        const nextMoveIndex = dataIndex + isBoardSize;

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) {
            break
        }

        const nextMove = cells[nextMoveIndex];

        if (nextMove.querySelector(selectors.figure)) {
            break;
        }

        isAddClasses && nextMove.classList.add(classes.active);
        getMoves(pawn, nextMove);
    }
}

// When a pawn reaches the desired square, we give it the opportunity to change into one of the captured pieces.
function handlerPawnTransformationPopup(pawn) {
    const pawnPromotionIndexes = {
        "white": [0, 1, 2, 3, 4, 5, 6, 7],
        "black": [56, 57, 58, 59, 60, 61, 62, 63]
    };
    const dataIndex = handlerDataIndex(pawn);
    const pawnType = pawn.dataset.type;

    if (!pawnPromotionIndexes[pawnType].includes(dataIndex)) {
        return;
    }

    handlerOpenPopup(`popup-figures-${pawnType}`);

    // popups.forEach(popup => {
    //     if (pawnType === popup.dataset.popupType) {
    //         const figures = [...popup.querySelectorAll(selectors.figure)];
    //
    //         if (figures.length < 1) return;
    //
    //         figures.forEach(figure => {
    //             figure.addEventListener('click', function() {
    //                 if (!this.closest(selectors.popup)) return;
    //
    //                 const pawnInner = pawn.closest(selectors.cellInner);
    //
    //                 pawnInner.innerHTML = this.outerHTML;
    //                 popup.classList.remove(classes.active);
    //                 checkersWrapper.classList.remove(classes.stopGame);
    //             });
    //         });
    //     }
    // });
}

// Transform the pawn into the selected piece.
function handlerPawnTransformation(target) {
    if (!target.closest(selectors.figure) || !target.closest(selectors.popup)) {
        return
    }

    const popup = target.closest(selectors.popup);
    const figure = target.closest(selectors.figure);
    const isTargetInner = isTargetFigure.closest(selectors.cellInner);

    isTargetInner.innerHTML = figure.outerHTML;
    popup.classList.remove(classes.active);
    checkersWrapper.classList.remove(classes.stopGame);
}

// Open the popup.
function handlerOpenPopup(popupId) {
    const popups = container.querySelectorAll(selectors.popup);

    if (popups.length < 1) {
        return
    }

    const openPopup = document.getElementById(popupId);

    setTimeout(() => {
        checkersWrapper.classList.add(classes.stopGame);
    }, 0)

    openPopup.classList.add(classes.active);
}

// Add the attacked figures to the appropriate pop-up window, where they will be saved.
function addedFiguresIsPopup(target) {
    if (!target.closest(selectors.popupClose)) {
        return;
    }

    const popup = target.closest(selectors.popup);

    if (!popup) {
        return;
    }

    popup.classList.remove(classes.active);
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
    // console.log(previousListMovesTo)
    directions.forEach(({dx, dy}) => {
        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) return;

        const nextMove = cells[nextMoveIndex];
        const nextMoveFigure = nextMove.querySelector(selectors.figure);
        // const classHandlerResult = handlerAddClasses(notMoveLeft, notMoveRight, isTargetIndex, nextMoveIndex);
        //
        // if (classHandlerResult) return;

        if ((dataIndex % isBoardSize === 0 && nextMoveIndex % isBoardSize === 7 && dy === -1) ||
            (dataIndex % isBoardSize === 7 && nextMoveIndex % isBoardSize === 0 && dy === 1)) {
            return
        }

        if (nextMove && nextMoveFigure && nextMoveFigure.dataset.type !== king.dataset.type) {
            // if (isAddClasses && !previousListMovesTo.includes(nextMove)) {
                isAddClasses && nextMove.classList.add(classes.attack);
            // }

            getMoves(king, king.closest(selectors.cell));
            getMoves(king, nextMove);
        }

        if (!nextMoveFigure) {
            if (isAddClasses && !previousListMovesTo.includes(nextMove)) {
                nextMove.classList.add(classes.active);
            }

            getMoves(king, king.closest(selectors.cell));
            getMoves(king, nextMove);
        }
    });

    // Castling moves.
    if (king.classList.contains(classes.firstMove)) {
        directionsLeftRight.forEach(direction => {
            for (let i=1; i<4; i++) {
                const nextMoveIndex = dataIndex + (direction * i);
                const nextMoveCastling = cells[nextMoveIndex];
                const figure = nextMoveCastling.querySelector(selectors.figure);

                if (figure) break;

                const figureRook = cells[nextMoveIndex + direction]?.querySelector(selectors.figure);

                if (figureRook && figureRook.classList.contains(classes.firstMove) && !previousListMovesTo.includes(nextMoveCastling)) {
                    isTargetFigureRook = figureRook;
                    isAddClasses && nextMoveCastling.classList.add(classes.active);
                    // getMoves(king, king.closest(selectors.cell));
                    getMoves(king, nextMoveCastling);
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
        const figureRook = cells[dataIndex + isTargetIndexCastling].querySelector(selectors.figure);

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

        if (!nextMoveFigure) {
            const isVectorValid = attackVectorToKing.length === 0 || attackVectorToKing.includes(nextMove);

            if (isVectorValid) {
                isAddClasses && nextMove.classList.add(classes.active);
                getMoves(horse, horse.closest(selectors.cell));
                getMoves(horse, nextMove);
            }
        } else if (!handlerFigureCurrentMove(nextMoveFigure)) {
            isAddClasses && nextMove.classList.add(classes.attack);
            getMoves(horse, horse.closest(selectors.cell));
            getMoves(horse, nextMove);
        }
    });
}

// We create a function that checks if the shape has not gone beyond the board, for these cells in this case we do not add classes to move.
function handlerAddClasses(arrLeft, arrRight, targetIndex, moveIndex) {
    return arrLeft.includes(targetIndex) && arrRight.includes(moveIndex) || arrRight.includes(targetIndex) && arrLeft.includes(moveIndex);
}

function handleQueenBishopRookMoves(figure, cells, isAddClasses) {
    const listNotMovesLeft = [0, 8, 16, 24, 32, 40, 48, 56];
    const listNotMovesRight = [7, 15, 23, 31, 39, 47, 55, 63];
    const dataIndex = handlerDataIndex(figure);
    let directions = [];

    if (figure.classList.contains(classesFigure.rook)) {
        directions = [
            {dx: -1, dy: 0},
            {dx: 0, dy: -1},
            {dx: 0, dy: 1},
            {dx: 1, dy: 0}
        ]
    } else if (figure.classList.contains(classesFigure.bishop)) {
        directions = [
            {dx: 1, dy: -1},
            {dx: 1, dy: 1},
            {dx: -1, dy: -1},
            {dx: -1, dy: 1}
        ];
    } else if (figure.classList.contains(classesFigure.queen)) {
        directions = [
            {dx: 1, dy: -1},
            {dx: 1, dy: 0},
            {dx: 1, dy: 1},
            {dx: -1, dy: -1},
            {dx: -1, dy: 1},
            {dx: 0, dy: -1},
            {dx: 0, dy: 1},
            {dx: -1, dy: 0}
        ];
    }

    directions.forEach(({dx, dy}, index) => {
        for (let i=1; i<8; i++) {
            const nextMoveIndex = dataIndex + (dx * i * isBoardSize + i * dy);

            if (0 > nextMoveIndex || nextMoveIndex >= cells.length) break;

            const nextMove = cells[nextMoveIndex];
            const nextMoveFigure = nextMove.querySelector(selectors.figure);

            if ((dataIndex % isBoardSize === 0 && nextMoveIndex % isBoardSize === 7 && dy === -1) ||
                (dataIndex % isBoardSize === 7 && nextMoveIndex % isBoardSize === 0 && dy === 1)) {
                break
            }

            const isVectorValid = attackVectorToKing.length === 0 || attackVectorToKing.includes(nextMove);

            if (isAddClasses) {
                if (!nextMoveFigure) {
                    if (isVectorValid) {
                        nextMove.classList.add(classes.active);
                    }
                } else {
                    if (!handlerFigureCurrentMove(nextMoveFigure) && isVectorValid) {
                        nextMove.classList.add(classes.attack);
                    }

                    break
                }
            } else {
                if (i === 1) {
                    getMoves(figure, figure.closest(selectors.cell));
                }

                getMoves(figure, nextMove);

                if (nextMoveFigure && !nextMoveFigure.classList.contains(classesFigure.king)) break;
            }

            // if ((nextMoveIndex % 8 === 0 && dy === -1) || (nextMoveIndex % 8 === 7 && dy === 1)) break;
            if ((listNotMovesLeft.includes(nextMoveIndex) && dy === -1) || (listNotMovesRight.includes(nextMoveIndex) && dy === 1)) break;
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

    const currentListMoves = listMoves.filter(move => handlerFigureCurrentMove(move.from));
    const previousListMoves = listMoves.filter(move => !handlerFigureCurrentMove(move.from));
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

        if (handlerFigureCurrentMove(elKing)) {
            let attackVector = [];

            for (let j=1; j<=8; j++) {
                if (arr[index - j].to.querySelector(selectors.figure) !== previousMove.from) {
                    attackVector.push(arr[index - j].to);
                } else {
                    attackVector.push(arr[index - j].to);
                    break;
                }
            }

            attackVectorToKing.push(...attackVector);
        }
    });
}

// We get the pieces in the array from which checkmate for the king.
function handlerListDefenderAndKingPieces(currentList, previousList) {
    let previousFrom;
    let isKingHasMove = false;
    let isKingShah = false;

    previousList.forEach(previousMove => {
        const figure = previousMove.to.querySelector(selectors.figure);

        if (figure && figure.classList.contains(classesFigure.king) && handlerFigureCurrentMove(figure)) {
            const figureKing = previousMove.to.querySelector(selectors.figure);

            // previousFrom = previousMove.from;
            figureKing.classList.add(classes.shah);
        }
    });

    // We check whether the move can be blocked if the king is in check after it.
    isBlockedMove = currentList.some(currentMove => {
        const figure = currentMove.to.querySelector(selectors.figure);
        // console.log(currentMove.to)
        return figure && figure.classList.contains(classesFigure.king) && !handlerFigureCurrentMove(figure);
    });

    if (!isBlockedMove) {
        previousListMovesTo = previousList.filter(obj => !obj.from.classList.contains(classesFigure.pawn));
        listAttackPawn = listAttackPawn.filter(moveAttackPawn => !handlerFigureCurrentMove(moveAttackPawn.from));
        previousListMovesTo = [...previousListMovesTo, ...listAttackPawn].map(({_, to}) => to);
    }

    // "listDefenderAndKingPieces" - Pushes pieces into the array that can substitute for the king if the king is in check.
    currentList.forEach(currentMove => {
        // const figure = currentMove.to.querySelector(selectors.figure);
        const cell = currentMove.from.closest(selectors.cell);
        const isKing = currentMove.from.classList.contains(classesFigure.king)
        const isAttackVectorCell = listDefenderAndKingPieces.includes(currentMove.from.closest(selectors.cell));
        const isAttackVectorToKingFigure = attackVectorToKing.includes(currentMove.to);

        if (isKing) {
            isKingShah = currentMove.from.classList.contains(classes.shah);
            const toFigure = currentMove.to.querySelector(selectors.figure)
            const isMove = currentMove.from.closest(selectors.cell) !== currentMove.to;
            const isMoveAttack = (toFigure && !handlerFigureCurrentMove(toFigure)) ? currentMove.to : false;

            if (isMove && (!previousListMovesTo.includes(currentMove.to) || previousListMovesTo.includes(isMoveAttack))) {
                isKingHasMove = true;
            }
        }

        // (figure === previousFrom || isAttackVectorToKingFigure)
        if (isAttackVectorToKingFigure && !isAttackVectorCell && !isKing) {
            listDefenderAndKingPieces.push(cell);
        }
    });

    if (!isKingHasMove && listDefenderAndKingPieces.length < 1 && (isKingShah || (isBlockedMove && isTargetFigure.classList.contains(classesFigure.king)))) {
        isBlockedMove = false;
        // console.log(previousListMovesTo)
        console.log("Checkmate");
    }

    // console.log(listDefenderAndKingPieces, "listDefenderAndKingPieces")
    console.log(attackVectorToKing, "attackVectorToKing")
    // console.log(isBlockedMove, "isBlockedMove")
}

// We get the index of the cell on which the figure is located.
function handlerDataIndex(element) {
    if (element.classList.contains(classes.figure)) {
        return +element.closest(selectors.cell).dataset.index;
    } else {
        return +element.dataset.index;
    }
}

// We delete the classes for the move.
function removeClasses(classList) {
    const cells = [...checkersWrapper.querySelectorAll(selectors.cell)];

    cells.forEach(cell => {
        const cellInner = cell.querySelector(selectors.cellInner);
        const figure = cell.querySelector(selectors.figure);

        classList.forEach(cls => {
            if (isTargetFigure.classList.contains(cls)) {
                isTargetFigure.classList.remove(cls);
            }

            if (cell.classList.contains(cls)) {
                cell.classList.remove(cls);
            }

            if (cellInner.classList.contains(cls)) {
                cellInner.classList.remove(cls);
            }

            if (figure && figure.classList.contains(cls)) {
                figure.classList.remove(classes.shah);
            }

            if (figure && cls === classes.enPassant && figure.classList.contains(classes.enPassant)) {
                figure.classList.remove(classes.enPassant);
            }
        });
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