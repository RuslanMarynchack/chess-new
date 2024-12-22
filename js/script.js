const selectors = {
    container: ".js-container",
    checkersWrapper: ".js-checkers",
    checkersCell: "js-checkers-cell"
}

const classes = {
    black: "is-black"
}

const container = document.querySelector(selectors.container);

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

            isBlackCell = !isBlackCell;

            if (isBlackCell) {
                cell.classList.add(classes.black);
            }

            cell.append(cellInner);
            checkersWrapper.append(cell);
        }
    }
}

createBoard()