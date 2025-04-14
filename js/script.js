"use strict"

const selectors = {
    container: '.js-container',
    checkersWrapper: '.js-checkers',
    cell: '.js-checkers-cell',
    cellInner: '.js-checkers-cell-inner',
    cellInnerLastMove: '.js-checkers-cell-inner.is-last-move',
    figure: '.js-cell-figure',
    figurePawn: '.js-cell-figure.is-pawn',
    figureRook: '.js-cell-figure.is-rook',
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
    stopGame: 'is-stop-game',
    playerBlack: 'is-player-black'
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
const checkersWrapper = container?.querySelector(selectors.checkersWrapper);
const animationDuration = 700;
const directionsLeftRight = [-1, 1]; // left, right

let moveDirections = [];
let potentialAttackCells = [];
let availableMoves = [];
let listAttackPawn = [];
let attackVectorsToKing = [];
let attackVectorsToKingWithoutObstacles = [];
let previousListMovesTo = [];
let defendersAndKing = [];
let isBoardSize = 8;
let isSelectedFigure = null;
let isSelectedRook = null;
let isSelectedIndex = 0;
let isBlockedMove = false;
let isCurrentPlayer = 'white';
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

        if (index >= 0 && index <= 15 || index >= 48 && index <= 63) {
            cellInner.append(figure);
        }

        // if (41 === index || 42 === index) {
        //     // && index <= 42 || index > 21 && index <= 23 || index === 51 || index === 53
        //     cellInner.append(figure);
        // } else if (index === 4 || index === 60) {
        //     cellInner.append(figure);
        // } else if (index === 1 || index === 6 || index === 57 || index === 62) {
        //     // cellInner.append(figure);
        // } else if (index === 0 || index === 19 || index === 56 || index === 63) {
        //     // || index === 56 || index === 63
        //     cellInner.append(figure);
        // } else if (index === 2 || index === 5 || index === 58 || index === 61) {
        //     cellInner.append(figure);
        // } else if (index === 4 || index === 60) {
        //     // cellInner.append(figure);
        // }

        // if (41 === index || 42 === index) {
        //     // index >= 8 && index <= 15 &&
        //     addElementClassesWithAttributes(figure, classesFigure.pawn, true, "black", "♟");
        // } else if (index >= 48 && index <= 55) {
        //     addElementClassesWithAttributes(figure, classesFigure.pawn, true, "white", "♙");
        //     } else if (index === 4) {
        //         addElementClassesWithAttributes(figure, classesFigure.king, true, "black", "♚");
        //     } else if (index === 60) {
        //         addElementClassesWithAttributes(figure, classesFigure.king, true, "white", "♔");
        // } else if (index === 1|| index === 6) {
        //     addElementClassesWithAttributes(figure, classesFigure.horse, false, "black", "♞");
        // } else if (index === 57  || index === 62) {
        //     addElementClassesWithAttributes(figure, classesFigure.horse, false, "white", "♘");
        // } else if (index === 0 || index === 19) {
        //     addElementClassesWithAttributes(figure, classesFigure.rook, true, "black", "♜");
        // } else if (index === 56 || index === 63) {
        //     addElementClassesWithAttributes(figure, classesFigure.rook, true, "white", "♖");
        // } else if (index === 2 || index === 5) {
        //     addElementClassesWithAttributes(figure, classesFigure.bishop, false, "black", "♝");
        // } else if (index === 58 || index === 61) {
        //     addElementClassesWithAttributes(figure, classesFigure.bishop, false, "white", "♗");
        // } else if (index === 4) {
        //     addElementClassesWithAttributes(figure, classesFigure.queen, false, "black", "♛");
        // } else if (index === 60) {
        //     addElementClassesWithAttributes(figure, classesFigure.queen, false, "white", "♕");
        // }

        if (index >= 8 && index <= 15) {
            addElementClassesWithAttributes(figure, classesFigure.pawn, true, "black", "♟");
        } else if (index >= 48 && index <= 55) {
            addElementClassesWithAttributes(figure, classesFigure.pawn, true, "white", "♙");
        } else if (index === 4) {
            addElementClassesWithAttributes(figure, classesFigure.king, true, "black", "♚");
        } else if (index === 60) {
            addElementClassesWithAttributes(figure, classesFigure.king, true, "white", "♔");
        } else if (index === 1|| index === 6) {
            addElementClassesWithAttributes(figure, classesFigure.horse, false, "black", "♞");
        } else if (index === 57  || index === 62) {
            addElementClassesWithAttributes(figure, classesFigure.horse, false, "white", "♘");
        } else if (index === 0 || index === 7) {
            addElementClassesWithAttributes(figure, classesFigure.rook, true, "black", "♜");
        } else if (index === 56 || index === 63) {
            addElementClassesWithAttributes(figure, classesFigure.rook, true, "white", "♖");
        } else if (index === 2 || index === 5) {
            addElementClassesWithAttributes(figure, classesFigure.bishop, false, "black", "♝");
        } else if (index === 58 || index === 61) {
            addElementClassesWithAttributes(figure, classesFigure.bishop, false, "white", "♗");
        } else if (index === 3) {
            addElementClassesWithAttributes(figure, classesFigure.queen, false, "black", "♛");
        } else if (index === 59) {
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
    return figure?.dataset.type === isCurrentPlayer
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

        if (!isSelectedFigure) return;

        const isTargetInner = isSelectedFigure.closest(selectors.cellInner);
        const cellInner = cell.querySelector(selectors.cellInner);
        const isCellActive = cell.classList.contains(classes.active);

        if (isCellActive || cell.classList.contains(classes.attack)) {
            checkersWrapper.classList.add(classes.stopGame);
            handlerAnimationFigure(cell, cells);

            if (isCurrentPlayer === 'black') {
                isLastMoveBlack = isSelectedFigure.closest(selectors.cellInner);
            } else {
                isLastMoveWhite = isSelectedFigure.closest(selectors.cellInner);
            }

            const cellsInnerLastMove = [...checkersWrapper.querySelectorAll(selectors.cellInnerLastMove)];

            removeClasses([classes.lastMove]);

            cellInner.classList.add(classes.lastMove);
            isSelectedFigure.closest(selectors.cellInner).classList.add(classes.lastMove);

            setTimeout(() => {
                if (figure) {
                    figure.remove();
                } else if (isSelectedFigure.classList.contains(classes.enPassant)) {
                    const dataIndex = handlerDataIndex(cell);
                    const boardSize = isSelectedFigure.dataset.type === "black" ? -isBoardSize : isBoardSize;
                    const enPassantRemoveFigure = cells[boardSize + dataIndex].querySelector(selectors.figure);

                    enPassantRemoveFigure.remove();
                }
            }, (animationDuration / 2));

            setTimeout(() => {

                cellInner.append(isSelectedFigure);

                if (isSelectedFigure.classList.contains(classesFigure.pawn)) {
                    handlerPawnTransformationPopup(isSelectedFigure);
                }

                handlerKingCastling(cell, cells);
                removeClasses([classes.enPassant]);

                cells.forEach(cell => {
                    handlerFigures(cell.querySelector(selectors.figure), cells, false);
                });

                if (isSelectedFigure.classList.contains(classes.firstMove)) {
                    removeClasses([classes.firstMove]);
                    isClassFirstMove = true;
                }

                isCurrentPlayer = isCurrentPlayer === 'black' ? 'white' : 'black';

                const attackVectorToKingCopy = [...attackVectorsToKing];

                handlerShahCheckmat();

                cells.forEach(cell => {
                    handlerFigures(cell.querySelector(selectors.figure), cells, false);
                });

                checkersWrapper.classList.remove(classes.stopGame);

                // We block a move if there is a threat to the king after it.
                if (isBlockedMove) {
                    handlerOpenPopup("popup-blocked-move");
                    isTargetInner.appendChild(isSelectedFigure);
                    isClassFirstMove && isSelectedFigure.classList.add(classes.firstMove);

                    removeClasses([classes.lastMove]);

                    attackVectorsToKing = [...attackVectorToKingCopy];
                    if (cellsInnerLastMove.length > 0) {
                        cellsInnerLastMove.forEach(cellInner => cellInner.classList.add(classes.lastMove));
                    }

                    isCurrentPlayer = isSelectedFigure.dataset.type;

                    figure && cellInner.appendChild(figure);
                    isBlockedMove = false;
                    return
                }

                handler50MoveRule(isCellActive);
                handlerCurrentPlayer();
                defendersAndKing = [];

                if (attackVectorsToKing.length < 1) {
                    removeClasses([classes.shah]);
                }
            }, animationDuration);

            availableMoves = [];
            potentialAttackCells = [];
            moveDirections = [];
            listAttackPawn = [];
            removeClasses([classes.active, classes.attack]);
            return;
        }

        if (lastClickedElement !== cell) {
            removeClasses([classes.active, classes.attack]);

            if (handlerFigureCurrentMove(isSelectedFigure)) {
                isSelectedFigure.closest(selectors.cellInner).classList.add(classes.active);
            }

            lastClickedElement = cell;
        }

        if (isSelectedFigure.closest(selectors.checkersWrapper) && handlerFigureCurrentMove(isSelectedFigure)) {
            handlerFigures(isSelectedFigure, cells, true);
        }
    });
}

// The function handler a click on a shape.
function handlerClickTargetFigure(cellEl, figureEl) {
    if (!cellEl?.classList.contains(classes.attack) && handlerFigureCurrentMove(figureEl)) {
        isSelectedFigure = figureEl;
        isSelectedIndex = +cellEl.dataset.index;
    }
}

// Handles shape movements based on their type.
// The function checks the type of piece and calls the appropriate movement handler for that piece.
// It works with pieces such as pawn, king, knight, rook, bishop, and queen.

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

    if (!handlerFigureCurrentMove(pawn) || (isSelectedFigure === pawn && pawn.classList.contains(classes.enPassant))) {
        directionsLeftRight.forEach(direction => {
            const directionFigure = cells[direction + dataIndex].querySelector(selectors.figure);

            if (directionFigure) {
                if (directionFigure.classList.contains(classes.firstMove) && handlerFigureCurrentMove(directionFigure)) {
                    pawn.classList.add(classes.enPassant);
                }

                if (
                    isSelectedFigure === pawn &&
                    directionFigure.closest(selectors.cellInner).classList.contains(classes.lastMove) &&
                    pawn.classList.contains(classes.enPassant)
                ) {
                    const boardSize = pawn.dataset.type === "black" ? isBoardSize : -isBoardSize;

                    cells[boardSize + (direction + dataIndex)].classList.add(classes.attack);
                }
            }
        });
    }

    directions.forEach(({dx, dy}) => {
        getMoves(pawn, pawn.closest(selectors.cell), availableMoves);

        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (handlerLimitingTravelAbroad(cells, dataIndex, nextMoveIndex, dy)) {
            return;
        }

        const nextMoveAttack = cells[nextMoveIndex];
        const nextMoveAttackFigure = nextMoveAttack.querySelector(selectors.figure);

        if (nextMoveAttackFigure) {
            if (pawn.dataset.type !== nextMoveAttackFigure.dataset.type && isMoveValidConsideringCheck(nextMoveAttack)) {
                getMoves(pawn, nextMoveAttack, availableMoves);
            } else {
                potentialAttackCells.push(nextMoveAttack);
            }
        }

        if (nextMoveAttack && nextMoveAttackFigure && !handlerFigureCurrentMove(nextMoveAttackFigure)) {
            if (isMoveValidConsideringCheck(nextMoveAttack)) {
                isAddClasses && nextMoveAttack.classList.add(classes.attack);
            }
        }
    })

    for (let i=1; i<forLength; i++) {
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
            getMoves(pawn, nextMove, availableMoves);
        }
    }
}

function isMoveValidConsideringCheck(nextMove) {
    let lineVectorFigureCount = 0;

    attackVectorsToKingWithoutObstacles.find(cell => {
        if (cell.querySelector(selectors.figure) && handlerFigureCurrentMove(cell.querySelector(selectors.figure))) {
            lineVectorFigureCount++;
        }
    });

    const isVectorValid = attackVectorsToKing.length === 0 || attackVectorsToKing.includes(nextMove);
    const targetCell = isSelectedFigure.closest(selectors.cell);
    const isOnLineToKing = attackVectorsToKingWithoutObstacles.includes(targetCell);
    const isNextMoveOnLine = attackVectorsToKingWithoutObstacles.includes(nextMove);
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
    const isTargetInner = isSelectedFigure.closest(selectors.cellInner);

    isTargetInner.innerHTML = figure.outerHTML;
    popup.classList.remove(classes.active);
    checkersWrapper.classList.remove(classes.stopGame);

    availableMoves = [];
    moveDirections = [];

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

    directions.forEach(({dx, dy}) => {
        const nextMoveIndex = dataIndex + (dx * isBoardSize + dy);

        if (handlerLimitingTravelAbroad(cells, dataIndex, nextMoveIndex, dy)) {
            return;
        }

        const nextMove = cells[nextMoveIndex];
        const nextMoveFigure = nextMove.querySelector(selectors.figure);

        if (
            nextMove &&
            nextMoveFigure &&
            nextMoveFigure.dataset.type !== king.dataset.type &&
            !potentialAttackCells.includes(nextMove) &&
            !previousListMovesTo.includes(nextMove)
        ) {
            isAddClasses && nextMove.classList.add(classes.attack);

            getMoves(king, king.closest(selectors.cell), availableMoves);
            getMoves(king, nextMove, availableMoves);
        }

        if (!nextMoveFigure) {
            if (isAddClasses && !previousListMovesTo.includes(nextMove)) {
                nextMove.classList.add(classes.active);
            }

            getMoves(king, king.closest(selectors.cell), availableMoves);
            getMoves(king, nextMove, availableMoves);
        }
    });

    // Castling moves.
    if (king.classList.contains(classes.firstMove)) {
        directionsLeftRight.forEach(direction => {
            for (let i=1; i<4; i++) {
                const nextMoveIndex = dataIndex + (direction * i);
                const nextMoveCastling = cells[nextMoveIndex];
                const blockingFigure  = nextMoveCastling.querySelector(selectors.figure);

                if (blockingFigure  || previousListMovesTo.includes(nextMoveCastling)) break;

                const figureRook = cells[nextMoveIndex + direction]?.querySelector(selectors.figureRook);

                if (figureRook && figureRook.classList.contains(classes.firstMove)) {
                    isSelectedRook = figureRook;

                    if (isAddClasses) {
                        const castlingTarget = direction === -1 ? cells[nextMoveIndex - direction] : cells[nextMoveIndex];

                        castlingTarget.classList.add(classes.active);
                    }

                    getMoves(king, nextMoveCastling, availableMoves);
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
        const isTargetIndexCastling = isSelectedIndex > dataIndex ? -1 : 1;
        const rookIndex = dataIndex + (isTargetIndexCastling === -1 ? -2 : 1);

        const figureRook = cells[rookIndex].querySelector(selectors.figure);

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

                getMoves(horse, horse.closest(selectors.cell), availableMoves);
                getMoves(horse, nextMove, availableMoves);
            }
        } else if (!handlerFigureCurrentMove(nextMoveFigure)) {
            if (isMoveValidConsideringCheck(nextMove)) {
                isAddClasses && nextMove.classList.add(classes.attack);

                getMoves(horse, horse.closest(selectors.cell), availableMoves);
                getMoves(horse, nextMove, availableMoves);
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
                        isAddClasses && nextMove.classList.add(classes.active);
                    }
                } else {
                    if (figure.dataset.type !== nextMoveFigure.dataset.type && isMoveValidConsideringCheck(nextMove)) {
                        isAddClasses && nextMove.classList.add(classes.attack);
                    }

                    break
                }

            } else {
                if (i === 1) {
                    getMoves(figure, figure.closest(selectors.cell), availableMoves);
                }

                if (nextMoveFigure) {
                    if (figure.dataset.type !== nextMoveFigure.dataset.type && isMoveValidConsideringCheck(nextMove)) {
                        getMoves(figure, nextMove, availableMoves);
                    } else {
                        potentialAttackCells.push(nextMove);
                    }
                } else {
                    getMoves(figure, nextMove, availableMoves);
                }

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
                getMoves(figure, figure.closest(selectors.cell), moveDirections);
            }

            if (figure.dataset.type === nextMoveFigure?.dataset.type) {
                break;
            }

            getMoves(figure, nextMove, moveDirections);

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
    if (availableMoves.length <= 0) return;

    const currentListMoves = availableMoves.filter(move => handlerFigureCurrentMove(move.movingFigure));
    const previousListMoves = availableMoves.filter(move => !handlerFigureCurrentMove(move.movingFigure));
    const previousLineVectorToKing = moveDirections.filter(move => !handlerFigureCurrentMove(move.movingFigure));

    attackVectorsToKing = [];
    attackVectorsToKingWithoutObstacles = [];

    if (currentListMoves.length === 0 || previousListMoves.length === 0) {
        return;
    }

    attackVectorsToKing.push(...handlerAttackVectorToKing(previousListMoves));

    attackVectorsToKingWithoutObstacles.push(...handlerAttackVectorToKing(previousLineVectorToKing));

    handlerListDefenderAndKingPieces(currentListMoves, previousListMoves);
}

// Returns all cells (vector) found on the attack path to the king.
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
    let isKingHasMove = false;
    let isKingShah = false;
    let figureKing = null;
    let currentListMovesTo = [];

    previousList.forEach(previousMove => {
        const figure = previousMove.destinationCell.querySelector(selectors.figure);

        if (figure && figure.classList.contains(classesFigure.king) && handlerFigureCurrentMove(figure)) {
            figureKing = previousMove.destinationCell.querySelector(selectors.figure);

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

        currentListMovesTo = currentList.filter(move => {
                const { movingFigure, destinationCell } = move;

                if (movingFigure.classList.contains(classesFigure.king)) {
                    if (previousListMovesTo.includes(destinationCell)) {
                        return false;
                    }
                }

                const toFigure = destinationCell.querySelector(selectors.figure);

                if (toFigure && toFigure.dataset.type === movingFigure.dataset.type) {
                    return false;
                }

                if (movingFigure.closest(selectors.cell) === destinationCell) {
                    return false;
                }

                return true;
        }).map(({ destinationCell }) => destinationCell);
    }

    // "listDefenderAndKingPieces" - Pushes pieces into the array that can substitute for the king if the king is in check.
    currentList.forEach(currentMove => {
        const cell = currentMove.movingFigure.closest(selectors.cell);
        const isKing = currentMove.movingFigure.classList.contains(classesFigure.king);
        const isAttackVectorCell = defendersAndKing.includes(currentMove.movingFigure.closest(selectors.cell));
        const isAttackVectorToKingFigure = attackVectorsToKing.includes(currentMove.destinationCell);

        if (isKing) {
            isKingShah = currentMove.movingFigure.classList.contains(classes.shah);
            const toFigure = currentMove.destinationCell.querySelector(selectors.figure);
            const isMove = currentMove.movingFigure.closest(selectors.cell) !== currentMove.destinationCell;
            const isMoveAttack = (toFigure && !handlerFigureCurrentMove(toFigure)) ? currentMove.destinationCell : false;

            if (isMove && (!previousListMovesTo.includes(currentMove.destinationCell) || previousListMovesTo.includes(isMoveAttack))) {
                isKingHasMove = true;
            }
        }

        if (isAttackVectorToKingFigure && !isAttackVectorCell && !isKing) {
            defendersAndKing.push(cell);
        }
    });

    if (!isKingHasMove) {
        if (isKingShah) {
            if (defendersAndKing.length < 1) {
                const winner = container.querySelector(selectors.winner);
                const isWinner = figureKing.dataset.type === "black" ? "White" : "Black";

                isBlockedMove = false;

                if (winner) {
                    winner.innerHTML = isWinner;
                    handlerOpenPopup("popup-game-over");
                } else {
                    console.log(`A victory for the ${isWinner}.`);
                }
            }
        } else if (currentListMovesTo.length < 1) {
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
            if (isSelectedFigure.classList.contains(cls)) {
                isSelectedFigure.classList.remove(cls);
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

// Indicates who is currently moving: if it is a black player, add a class for styling, otherwise remove this class.
function handlerCurrentPlayer() {
    if (isCurrentPlayer === "black") {
        checkersWrapper.classList.add(classes.playerBlack);
    } else {
        checkersWrapper.classList.remove(classes.playerBlack);
    }
}

// Adding animation for figures when moving.
function handlerAnimationFigure(cellMove, listCell) {
    const checkersWrapperRect = container.querySelector(selectors.checkersWrapper).getBoundingClientRect();
    const cellMoveRect = cellMove.getBoundingClientRect();
    const isTargetFigureRect = isSelectedFigure.getBoundingClientRect();

    const translateY = (cellMoveRect.top - checkersWrapperRect.top) - (isTargetFigureRect.top - checkersWrapperRect.top);
    const translateX = (cellMoveRect.left - checkersWrapperRect.left) - (isTargetFigureRect.left - checkersWrapperRect.left);

    const dataIndex = handlerDataIndex(cellMove);
    const isTargetAhead = isSelectedIndex > dataIndex;
    const indexRock = +cellMove.dataset.index + (isTargetAhead ? -2 : 1);
    const cellRock = listCell[indexRock];
    const figureRook = cellRock?.querySelector(selectors.figure);

    isSelectedFigure.style.transform = `translate(${translateX}px, ${translateY}px)`;

    // Adding animation for castling.
    if (isSelectedFigure.classList.contains(classesFigure.king) &&
        isSelectedFigure.classList.contains(classes.firstMove) &&
        figureRook &&
        figureRook.classList.contains(classesFigure.rook) &&
        figureRook.classList.contains(classes.firstMove)
    ) {
        const figureRookTranslateX = isTargetAhead ? '326%' : '-218%';

        figureRook.style.transform = `translateX(${figureRookTranslateX})`;

        window.setTimeout(() => {
            figureRook.classList.remove(classes.firstMove);
        }, (animationDuration + 10));
    }

    setTimeout(() => {
        isSelectedFigure.removeAttribute('style');
        figureRook?.removeAttribute('style');
    }, animationDuration);
}