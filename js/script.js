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
    popupClose: '.js-popup-close',
    btnRestart: '.js-restart',
    winner: '.is-winner'
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

const container = document.querySelector(selectors.container);
const checkersWrapper = container.querySelector(selectors.checkersWrapper);
const timeAnimation = 700;
const directionsLeftRight = [-1, 1];

let listMovesVectors = [];
let listMoves = [];
let listAttackPawn = [];
let attackVectorToKing = [];
let lineVectorToKing = [];
let previousListMovesTo = [];
let listDefenderAndKingPieces = [];
let isBoardSize = 8;
let isTargetFigure = null;
let isTargetFigureRook = null;
let isTargetIndex = 0;
let isBlockedMove = false;
let isCurrentMove = 'black';
let countMoves = 0;

function createBoard() {
    if (!container) {
        console.warn("Container not found!")
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

        if (index === 41) {
        // && index <= 42 || index > 21 && index <= 23 || index === 51 || index === 53
            cellInner.append(figure);
        } else if (index === 3 || index === 59) {
            cellInner.append(figure);
        } else if (index === 1 || index === 6 || index === 57 || index === 62) {
            // cellInner.append(figure);
        } else if (index === 0 || index === 19) {
        // || index === 56 || index === 63
            cellInner.append(figure);
        } else if (index === 2 || index === 5 || index === 58 || index === 61) {
            // cellInner.append(figure);
        } else if (index === 4 || index === 60) {
            // cellInner.append(figure);
        }

        if (index === 40) {
        // && index <= 42
        //     addElementClassesWithAttributes(figure, classesFigure.pawn, true, "black", "♟");
        } else if (index === 41) {
            // index > 21 && index <= 23 || index === 51 || index === 53
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

// The function compares the piece type with the current move type and returns `true`.
function handlerFigureCurrentMove(figure) {
    return figure?.dataset.type === isCurrentMove
}


// Handles clicking on a piece while it is moving on the board.
// The function determines whether the click is on an active square or a piece, which allows you to make a move,
// and performs animations, piece transformations, move order changes, and checkmate checks.
// Also takes into account the “50 moves” rule and the possibility of blocking a move due to a threat to the king.
function handlerClickFigureOnMove() {
    const cells = [...checkersWrapper.querySelectorAll(selectors.cell)];
    let lastClickedElement = null;
    let isLastMoveBlack = null;
    let isLastMoveWhite = null;

    window.addEventListener("click", (e) => {
        let isClassFirstMove = false;
        let cell = e.target.closest(selectors.cell);

        if (e.target.closest(selectors.popupClose)) {
            closePopup(e.target);
        }

        if (e.target.closest(selectors.btnRestart)) {
            document.location.reload();
        }

        if (e.target.closest(selectors.figure) && e.target.closest(selectors.popup)) {
            handlerPawnTransformation(e.target);
        }

        if (!cell) {
            return;
        }

        const figure = cell.querySelector(selectors.figure);

        handlerClickTargetFigure(cell, figure);

        if (!isTargetFigure) return;

        const isTargetInner = isTargetFigure.closest(selectors.cellInner);
        const cellInner = cell.querySelector(selectors.cellInner);
        // const isPawnBoardSize = handlerBoardSize(isCurrentMove !== 'black');
        const isCellActive = cell.classList.contains(classes.active);

        if (isCellActive || cell.classList.contains(classes.attack)) {
            checkersWrapper.classList.add(classes.stopGame);
            handlerAnimationFigure(cell, cells);

            if (isCurrentMove === 'black') {
                isLastMoveBlack = isTargetFigure.closest(selectors.cellInner);
            } else {
                isLastMoveWhite = isTargetFigure.closest(selectors.cellInner);
            }

            const cellsInnerLastMove = [...checkersWrapper.querySelectorAll(selectors.cellInnerLastMove)];

            removeClasses([classes.lastMove]);

            cellInner.classList.add(classes.lastMove);
            isTargetFigure.closest(selectors.cellInner).classList.add(classes.lastMove);

            setTimeout(() => {
                if (figure) {
                    figure.remove();
                } else if (isTargetFigure.classList.contains(classes.enPassant)) {
                    const dataIndex = handlerDataIndex(cell);
                    const enPassantRemoveFigure = cells[-isBoardSize + dataIndex].querySelector(selectors.figure);

                    enPassantRemoveFigure.remove();
                }
            }, (timeAnimation / 2));

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

                const attackVectorToKingCopy = [...attackVectorToKing];
                handlerShahCheckmat();

                checkersWrapper.classList.remove(classes.stopGame);

                // We block a move if there is a threat to the king after it.
                if (isBlockedMove) {
                    handlerOpenPopup("popup-blocked-move");
                    isTargetInner.appendChild(isTargetFigure);
                    isClassFirstMove && isTargetFigure.classList.add(classes.firstMove);

                    removeClasses([classes.lastMove]);

                    attackVectorToKing = [...attackVectorToKingCopy];
                    if (cellsInnerLastMove.length > 0) {
                        cellsInnerLastMove.forEach(cellInner => cellInner.classList.add(classes.lastMove));
                    }

                    isCurrentMove = isTargetFigure.dataset.type;

                    figure && cellInner.appendChild(figure);
                    isBlockedMove = false;
                    return
                }

                // removeClasses([classes.enPassant]);

                handler50MoveRule(isCellActive);

                listDefenderAndKingPieces = [];

                if (attackVectorToKing.length < 1) {
                    removeClasses([classes.shah]);
                }
            }, timeAnimation);

            listMoves = [];
            listMovesVectors = [];
            listAttackPawn = [];
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

// The function handler a click on a shape.
function handlerClickTargetFigure(cellEl, figureEl) {
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
        isTargetIndex = +cellEl.dataset.index;
    }
}

// Handles shape movements based on their type.
// The function checks the type of piece and calls the appropriate movement handler for that piece.
// It works with pieces such as pawn, king, knight, rook, bishop, and queen.
//
// @param {HTMLElement} targetFigure - The element of the figure for which you want to handle the motion.
// @param {Array} list - A list of available squares or other data related to possible moves.
// @param {boolean} isAddClasses - If true, adds classes to display the available figure moves.
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
    const dataIndex = handlerDataIndex(pawn);
    const isBlack = pawn.dataset.type === 'black';
    const forLength = pawn.classList.contains(classes.firstMove) ? 3 : 2;

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
        directionsLeftRight.forEach(direction => {
            const directionFigure = cells[direction + dataIndex].querySelector(selectors.figure);

            if (directionFigure) {
                if (directionFigure.classList.contains(classes.firstMove) && handlerFigureCurrentMove(directionFigure)) {
                    pawn.classList.add(classes.enPassant);
                }

                if (isTargetFigure === pawn && directionFigure.closest(selectors.cellInner).classList.contains(classes.lastMove) && pawn.classList.contains(classes.enPassant)) {
                    cells[isBoardSize + (direction + dataIndex)].classList.add(classes.attack);
                }
            }
        });
    }

    directions.forEach(({dx, dy}) => {
        getMoves(pawn, pawn.closest(selectors.cell), listMoves);

        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (handlerLimitingTravelAbroad(cells, dataIndex, nextMoveIndex, dy)) {
            return;
        }

        const nextMoveAttack = cells[nextMoveIndex];
        const nextMoveAttackFigure = nextMoveAttack.querySelector(selectors.figure);

        // if (!nextMoveAttackFigure) {

        // getMoves(pawn, nextMoveAttack, listMovesVectors);
        getMoves(pawn, nextMoveAttack, listAttackPawn);
            // listAttackPawn.push({
            //     from: pawn,
            //     to: nextMoveAttack
            // });
        // }

        if (nextMoveAttack && nextMoveAttackFigure && !handlerFigureCurrentMove(nextMoveAttackFigure)) {
            if (isMoveValidConsideringCheck(nextMoveAttack)) {
                isAddClasses && nextMoveAttack.classList.add(classes.attack);
            }
        }
    })

    for (let i=1; i<forLength; i++) {
        // const isBoardSize = handlerBoardSize(isBlack) * i;
        const boardOffset = isBlack ? isBoardSize : -isBoardSize;
        const nextMoveIndex = dataIndex + (boardOffset * i);

        if (0 > nextMoveIndex || nextMoveIndex >= cells.length) {
            break
        }

        const nextMove = cells[nextMoveIndex];

        if (nextMove.querySelector(selectors.figure)) {
            break;
        }

        if (isMoveValidConsideringCheck(nextMove)) {
            isAddClasses && nextMove.classList.add(classes.active);
            getMoves(pawn, nextMove, listMoves);
        }
    }
}

function isMoveValidConsideringCheck(nextMove) {
    let lineVectorFigureCount = 0;

    lineVectorToKing.find(cell => {
        if (cell.querySelector(selectors.figure) && handlerFigureCurrentMove(cell.querySelector(selectors.figure))) {
            lineVectorFigureCount++;
        }
    });

    const isVectorValid = attackVectorToKing.length === 0 || attackVectorToKing.includes(nextMove);
    const targetCell = isTargetFigure.closest(selectors.cell);
    const isOnLineToKing = lineVectorToKing.includes(targetCell);
    const isNextMoveOnLine = lineVectorToKing.includes(nextMove);
    const isValidMoveConsideringLine = (!isOnLineToKing || lineVectorFigureCount > 1) || (isOnLineToKing && isNextMoveOnLine);

    return isVectorValid && isValidMoveConsideringLine;
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
}

// Transform the pawn into the selected piece.
function handlerPawnTransformation(target) {
    const cells = [...container.querySelectorAll(selectors.cell)];

    const popup = target.closest(selectors.popup);
    const figure = target.closest(selectors.figure);
    const isTargetInner = isTargetFigure.closest(selectors.cellInner);

    isTargetInner.innerHTML = figure.outerHTML;
    popup.classList.remove(classes.active);
    checkersWrapper.classList.remove(classes.stopGame);

    listMoves = [];
    listMovesVectors = [];

    cells.forEach(cell => {
        handlerFigures(cell.querySelector(selectors.figure), cells, false);
    });

    handlerShahCheckmat();
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
    }, 0);

    openPopup.classList.add(classes.active);
}

// Close the pop-up.
function closePopup(target) {
    const popup = target.closest(selectors.popup);

    if (popup) {
        popup.classList.remove(classes.active);
        checkersWrapper.classList.remove(classes.stopGame);
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
    // console.log(previousListMovesTo)
    directions.forEach(({dx, dy}) => {
        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (handlerLimitingTravelAbroad(cells, dataIndex, nextMoveIndex, dy)) {
            return;
        }

        const nextMove = cells[nextMoveIndex];
        const nextMoveFigure = nextMove.querySelector(selectors.figure);
        console.log(previousListMovesTo)
        if (nextMove && nextMoveFigure && nextMoveFigure.dataset.type !== king.dataset.type && !previousListMovesTo.includes(nextMove)) {
            isAddClasses && nextMove.classList.add(classes.attack);

            getMoves(king, king.closest(selectors.cell), listMoves);
            getMoves(king, nextMove, listMoves);
        }

        if (!nextMoveFigure) {
            if (isAddClasses && !previousListMovesTo.includes(nextMove)) {
                nextMove.classList.add(classes.active);
            }

            getMoves(king, king.closest(selectors.cell), listMoves);
            getMoves(king, nextMove, listMoves);
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
                    getMoves(king, nextMoveCastling, listMoves);
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
            if (isMoveValidConsideringCheck(nextMove)) {
                isAddClasses && nextMove.classList.add(classes.active);

                getMoves(horse, horse.closest(selectors.cell), listMoves);
                getMoves(horse, nextMove, listMoves);
            }
        } else if (!handlerFigureCurrentMove(nextMoveFigure)) {
            if (isMoveValidConsideringCheck(nextMove)) {
                isAddClasses && nextMove.classList.add(classes.attack);

                getMoves(horse, horse.closest(selectors.cell), listMoves);
                getMoves(horse, nextMove, listMoves);
            }
        }
    });
}

 // Processes moves for the following pieces: queen, bishop and rook.
 // The function determines the available moves for these pieces on the chessboard,
 // by checking the directions of movement (horizontal, vertical, diagonal)
 // and distance limits.
 //
 // @param "{HTMLElement} figure" - The element of the moving piece.
 // @param {Array} cells - A list of available cells where the figure can move.
 // @param {boolean} isAddClasses - If true, adds classes to display the available moves.

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

    getMovesWithoutTakingIntoAccountObstacles(cells, figure, directions, dataIndex, listNotMovesLeft, listNotMovesRight);

    directions.forEach(({dx, dy}) => {
        for (let i=1; i<8; i++) {
            const nextMoveIndex = dataIndex + (dx * i * isBoardSize + i * dy);

            if (handlerLimitingTravelAbroad(cells, dataIndex, nextMoveIndex, dy)) {
                break;
            }

            const nextMove = cells[nextMoveIndex];
            const nextMoveFigure = nextMove.querySelector(selectors.figure);

            if (isAddClasses) {
                if (!nextMoveFigure) {
                    if (isMoveValidConsideringCheck(nextMove)) {
                        nextMove.classList.add(classes.active);
                    }
                } else {
                    if (!handlerFigureCurrentMove(nextMoveFigure) && isMoveValidConsideringCheck(nextMove)) {
                        nextMove.classList.add(classes.attack);
                    }

                    break
                }

            } else {
                if (i === 1) {
                    getMoves(figure, figure.closest(selectors.cell), listMoves);
                }

                getMoves(figure, nextMove, listMoves);

                if (nextMoveFigure && !nextMoveFigure.classList.contains(classesFigure.king)) break;
            }

            if (handlerRestrictingMovementSideDirection(listNotMovesLeft, listNotMovesRight, nextMoveIndex, dy)) break;
        }
    });
}

// Calculates the available moves for a piece without taking into account obstacles (pieces that block the move).
// The function checks all possible directions of a piece's movement within the board, and adds the possible moves
// to the list without checking for other pieces or obstacles.
//
// @param {Array} cells - An array of all cells on the board.
// @param {HTMLElement} figure - The element of the figure for which the possible moves are calculated.
// @param {Array} directions - An array of directions of movement, each containing `dx' (horizontal offset) and `dy' (vertical offset).
// @param {number} dataIndex - The current index of the cell on the board where the figure is located.
// listNotMovesLeft - A list of cell indices that block the movement of the figure to the left.
// listNotMovesRight - A list of cell indices that block the movement of the shape to the right.
function getMovesWithoutTakingIntoAccountObstacles(cells, figure, directions, dataIndex, listNotMovesLeft, listNotMovesRight) {
    directions.forEach(({dx, dy}) => {
        for (let i = 1; i < 8; i++) {
            const nextMoveIndex = dataIndex + (dx * i * isBoardSize + i * dy);

            if (handlerLimitingTravelAbroad(cells, dataIndex, nextMoveIndex, dy)) {
                break;
            }

            const nextMove = cells[nextMoveIndex];
            const nextMoveFigure = nextMove.querySelector(selectors.figure);

            if (i === 1) {
                getMoves(figure, figure.closest(selectors.cell), listMovesVectors);
                // listMovesVectors.push(
                //     {
                //         from: figure,
                //         to: figure.closest(selectors.cell)
                //     }
                // );
            }

            if (figure.dataset.type === nextMoveFigure?.dataset.type) {
                break;
            }

            getMoves(figure, nextMove, listMovesVectors);
            // listMovesVectors.push(
            //     {
            //         from: figure,
            //         to: nextMove
            //     }
            // );

            if (handlerRestrictingMovementSideDirection(listNotMovesLeft, listNotMovesRight, nextMoveIndex, dy)) break;
        }
    });
}

// Restricts the movement of a piece off the board in certain directions.
// The function checks whether the move is off the board, taking into account the positions of the cells
// and the direction of the piece's movement.
//
// @param {Array} cells - An array of all cells on the board.
// @param {number} index - The current index of the cell where the piece is located.
// @param {number} moveIndex - The integral index of the cell to which the shape is trying to move.
// @param {number} dy - Vertical offset indicating the direction of movement (1 for down, -1 for up).
// @returns {boolean} - Returns `true` if the move goes beyond the board or there are restrictions, otherwise `false`.
function handlerLimitingTravelAbroad(cells, index, moveIndex, dy) {
    if (0 > moveIndex || moveIndex >= cells.length) {
        return true;
    }

    if (
        (index % isBoardSize === 0 && moveIndex % isBoardSize === 7 && dy === -1) ||
        (index % isBoardSize === 7 && moveIndex % isBoardSize === 0 && dy === 1)
    ) {
        return true;
    }

    return false;
}

function handlerRestrictingMovementSideDirection(left, right, moveIndex, dy) {
    return (left.includes(moveIndex) && dy === -1) || (right.includes(moveIndex) && dy === 1)
}

// We get all the moves of the current chess side.
function getMoves(fromFigure, cell, arr) {
    arr.push({
        movingFigure: fromFigure,
        destinationCell: cell
    });
}

// We process moves when the king is in danger.
function handlerShahCheckmat() {
    if (listMoves.length <= 0) return;

    // listMovesVectors = [];
    const currentListMoves = listMoves.filter(move => handlerFigureCurrentMove(move.movingFigure));
    const previousListMoves = listMoves.filter(move => !handlerFigureCurrentMove(move.movingFigure));
    const previousLineVectorToKing = listMovesVectors.filter(move => !handlerFigureCurrentMove(move.movingFigure));
    // listDefenderAndKingPieces = [];
    attackVectorToKing = [];
    lineVectorToKing = [];

    if (currentListMoves.length === 0 || previousListMoves.length === 0) {
        return;
    }

    attackVectorToKing.push(...handlerAttackVectorToKing(previousListMoves));

    lineVectorToKing.push(...handlerAttackVectorToKing(previousLineVectorToKing));
    previousLineVectorToKing.forEach(move => {
        // if (move.to.querySelector(`.${classesFigure.king}`)) {
        //     console.log(move.from)
        // }

        console.log(move.destinationCell);
    });
    // console.log(listMovesVectors)
    // lineVectorToKing = []
    handlerListDefenderAndKingPieces(currentListMoves, previousListMoves);
}

// We get the direction of the pieces' moves to the king into an array.
function handlerAttackVectorToKing(list) {
    let attackVectors = []

    list.forEach((previousMove, index, arr) => {
        const elKing = previousMove.destinationCell.querySelector(`.${classesFigure.king}`);

        if (handlerFigureCurrentMove(elKing)) {
            let vector = [];

            for (let j=1; j<=8; j++) {
                if (arr[index - j].destinationCell.querySelector(selectors.figure) !== previousMove.movingFigure) {
                    vector.push(arr[index - j].destinationCell);
                } else {
                    vector.push(arr[index - j].destinationCell);
                    break;
                }
            }

            attackVectors.push(...vector);
        }
    });

    return attackVectors
}

// We get the pieces in the array from which checkmate for the king.
function handlerListDefenderAndKingPieces(currentList, previousList) {
    let previousFrom;
    let isKingHasMove = false;
    let isKingShah = false;
    let figureKing = null;

    previousList.forEach(previousMove => {
        const figure = previousMove.destinationCell.querySelector(selectors.figure);

        if (figure && figure.classList.contains(classesFigure.king) && handlerFigureCurrentMove(figure)) {
            figureKing = previousMove.destinationCell.querySelector(selectors.figure);

            // previousFrom = previousMove.from;
            figureKing.classList.add(classes.shah);
        }
    });

    // We check whether the move can be blocked if the king is in check after it.
    isBlockedMove = currentList.some(currentMove => {
        const figure = currentMove.destinationCell.querySelector(selectors.figure);

        return figure && figure.classList.contains(classesFigure.king) && !handlerFigureCurrentMove(figure);
    });

    if (!isBlockedMove) {
        previousListMovesTo = previousList.filter(obj => !obj.movingFigure.classList.contains(classesFigure.pawn));
        listAttackPawn = listAttackPawn.filter(moveAttackPawn => !handlerFigureCurrentMove(moveAttackPawn.movingFigure));
        previousListMovesTo = [...previousListMovesTo, ...listAttackPawn].map(({movingFigure, destinationCell}) => {
            if (movingFigure.closest(selectors.cell) !== destinationCell) {
                return destinationCell
            }
        }).filter(Boolean);
    }

    // "listDefenderAndKingPieces" - Pushes pieces into the array that can substitute for the king if the king is in check.
    currentList.forEach(currentMove => {
        // const figure = currentMove.to.querySelector(selectors.figure);
        const cell = currentMove.movingFigure.closest(selectors.cell);
        const isKing = currentMove.movingFigure.classList.contains(classesFigure.king)
        const isAttackVectorCell = listDefenderAndKingPieces.includes(currentMove.movingFigure.closest(selectors.cell));
        const isAttackVectorToKingFigure = attackVectorToKing.includes(currentMove.destinationCell);

        if (isKing) {
            isKingShah = currentMove.movingFigure.classList.contains(classes.shah);
            const toFigure = currentMove.destinationCell.querySelector(selectors.figure)
            const isMove = currentMove.movingFigure.closest(selectors.cell) !== currentMove.destinationCell;
            const isMoveAttack = (toFigure && !handlerFigureCurrentMove(toFigure)) ? currentMove.destinationCell : false;

            if (isMove && (!previousListMovesTo.includes(currentMove.destinationCell) || previousListMovesTo.includes(isMoveAttack))) {
                isKingHasMove = true;
            }
        }

        // (figure === previousFrom || isAttackVectorToKingFigure)
        if (isAttackVectorToKingFigure && !isAttackVectorCell && !isKing) {
            listDefenderAndKingPieces.push(cell);
        }
    });

    console.log(isKingHasMove)
    if (!isKingHasMove && listDefenderAndKingPieces.length < 1) {
        if (isKingShah) {
            // || (isBlockedMove && isTargetFigure.classList.contains(classesFigure.king))
            const winner = container.querySelector(selectors.winner);
            const isWinner = figureKing.dataset.type === "black" ? "White" : "Black";

            isBlockedMove = false;

            if (winner) {
                winner.innerHTML = isWinner;
                handlerOpenPopup("popup-game-over");
            } else {
                console.log(`A victory for the ${isWinner}.`);
            }
        } else {
            handlerOpenPopup("popup-ending-in-draw");
        }
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

// Calling the fifty-move rule popup.
function handler50MoveRule(isMove) {
    if (isMove) {
        countMoves++

        if (countMoves >= 50) {
            handlerOpenPopup("popup-ending-in-draw");
        }
    } else {
        countMoves = 0;
    }
}

// Delete classes.
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
    const isTargetAhead = isTargetIndex > dataIndex;
    const indexRock = +cellMove.dataset.index + (isTargetAhead ? -1 : 1);
    const cellRock = listCell[indexRock];
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

        window.setTimeout(() => {
            figureRook.classList.remove(classes.firstMove);
        }, (timeAnimation + 10));
    }

    setTimeout(() => {
        isTargetFigure.removeAttribute('style');
        figureRook?.removeAttribute('style');
    }, timeAnimation);
}