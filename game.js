'use strict'
var gRestartButton = {
    on: '😀',
    dead: '😵',
    win: '😎'
}
var BOMB = '💣';
var FLAG = '🕹';

var gBoard;
var gGame;
var gLevel = {
    size: 4,
    mineCount: 2
}

var gTimerInterval;

function init() {
    renderEmoji('on');
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lastCell: null,
        moves: [],
        cheatMode: false,
        livesLeft: 3,
        dirctorOn: false,
        mineCount: 0
    }
    renderTimer();
    createBoard();
    renderBoard();
    renderLevels(gLevel.size);
    renderLives();
    renderCheats();
    renderHints();
    renderDirectorModal()

}



function createBoard() {
    gBoard = [];
    for (var i = 0; i < gLevel.size; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isExpload: false
            }
            gBoard[i][j] = cell;
        }
    }

}

function setMinesNegsCount() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var cell = gBoard[i][j];

            if (cell.isMine === true) continue;
            var mineNegs = checkNegs(i, j);
            cell.minesAroundCount = mineNegs;
        }
    }
}

function checkNegs(iIdx, jIdx) {
    var mineNegs = 0;
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue
            if (gBoard[i][j].isMine === true) mineNegs++;
        }
    }
    return mineNegs
}

function placeMines(iIdx, jIdx) {
    var minesCount = 0;
    while (minesCount < gLevel.mineCount) {
        var i = getRandomIntInclusive(0, gLevel.size - 1)
        var j = getRandomIntInclusive(0, gLevel.size - 1)
        if (gBoard[i][j].isMine === false && (i !== iIdx || j !== jIdx)) {
            gBoard[i][j].isMine = true;
            minesCount++
        }
    }
}

function renderBoard() {
    var mat = gBoard;
    var strHTML = '<tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            strHTML += createCellHTML(i, j)
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody>';
    var elContainer = document.querySelector('.board');
    elContainer.innerHTML = strHTML;
}

function createCellHTML(i, j) {
    var cell = gBoard[i][j];
    var hidenCell = cell.isMarked == true ? 'cell-mark' : 'cell-hide';
    var className = `cell cell${i}-${j} ${cell.isShown ? 'cell-show' : hidenCell} ${cell.isExpload ? 'cell-expload' : ' '}`;
    var value = cell.isMine ? BOMB : cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
    value = !cell.isShown ? "  " : value;
    return `<td oncontextmenu="cellMarked(${i},${j},event)" onclick="cellClicked(${i},${j},this)" class="${className}">${cell.isMarked && !cell.isShown ? FLAG : value} </td>`

}

function renderLevels(size) {
    var elLevels = document.querySelectorAll('.level')
    for (var i = 0; i < elLevels.length; i++) {
        elLevels[i].style.backgroundColor = '#f9d56e';
        elLevels[i].style.color = '#d15757';
        elLevels[i].style.border = '';
    }
    switch (size) {
        case 4:
            elLevels[0].style.backgroundColor = '#14b1ab';
            elLevels[0].style.color = '#f9d56e';
            elLevels[0].style.border = 'outset 5px #14b1ab ';
            break;
            case 8:
                elLevels[1].style.backgroundColor = '#14b1ab';
                elLevels[1].style.color = '#f9d56e';
                elLevels[1].style.border = 'outset 5px #14b1ab ';
                break;
                case 12:
                    elLevels[2].style.backgroundColor = '#14b1ab';
                    elLevels[2].style.color = '#f9d56e';
                    elLevels[2].style.border = 'outset 5px #14b1ab ';
            break;
    }
}
function renderCheats() {
    var elCheats = document.querySelector('.cheats')
    if (gGame.cheatMode === true) {
        elCheats.style.display = 'inline';
    }
    else {
        elCheats.style.display = 'none';
    }
    renderBoard();
}

function renderHints(elHint) {
    if (elHint) {
        elHint.style.display = "none";
    }
    else {
        var elHints = document.querySelectorAll('.cheat')
        for (var i = 0; i < 3; i++) {
            elHints[i].style.display = "inline-block";
        }
    }
}

function renderLives() {
    if (gGame.cheatMode === false) return;
    var elLives = document.querySelectorAll('.live')
    for (var i = 0; i < 3; i++) {
        elLives[i].style.display = "none"
    }
    for (var i = 0; i < gGame.livesLeft; i++) {
        elLives[i].style.display = "inline-block"
    }
}

function renderTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gGame.secsPassed;

}

function renderEmoji(state) {
    var elRestarBtn = document.querySelector('.restart')
    elRestarBtn.innerText = gRestartButton[state];

}

function renderDirectorModal() {
    var elModal = document.querySelector('.director-modal')
    if (gGame.directorOn) {
        elModal.style.display = "inline"
        var str = elModal.querySelector('span')
        str.innerText = gLevel.mineCount - gGame.mineCount
    }
    else {
        elModal.style.display = "none"
    }
}


function startTimer() {
    gTimerInterval = setInterval(function () {
        gGame.secsPassed += 1;
        renderTimer();
    }, 1000);
}

function cellMarked(i, j, ev) {
    if (!gGame.isOn || checkNumOfFlags() == gLevel.mineCount) return;
    ev.preventDefault();
    gBoard[i][j].isMarked = true;
    gGame.markedCount++;
    gGame.moves.push({ i, j, move: 'mark' })
    checkGameOver(i, j, false);
    renderBoard();

}

function cellClicked(i, j) {
    if (gGame.directorOn) {
        setManualMine(i, j)
        return
    }
    if(gBoard[i][j].isShown)return

    if (!gGame.isOn) {
        if (gGame.lastCell === BOMB || gGame.lastCell === 'win') {
            return;
        }

        gGame.isOn = true;
        startTimer();
        placeMines(i, j);
        setMinesNegsCount()
    }
    if (gBoard[i][j].isShown === false) {
        if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isMine === false) {
            var expanded = true;
            expandShown(i, j);
        }
        else {
            gGame.shownCount++;
        }
    }
    if (!expanded && gBoard[i][j].isMine === false) gGame.moves.push({ i, j, move: 'show' })
    gBoard[i][j].isMarked = false;
    gBoard[i][j].isShown = true;
    renderBoard();
    checkGameOver(i, j, true);

}

function openCell() {

}


function checkGameOver(i, j, isLeftClick) {
    if (gBoard[i][j].isMine == true && isLeftClick) {
        if (gGame.cheatMode === true && gGame.livesLeft > 0) {
            gGame.livesLeft--;
            renderLives()
            gGame.moves.push({ i, j, move: 'dead' })
            if (gGame.livesLeft === 0) gameOver(false, i, j);
            return
        }
        gameOver(false, i, j);
        return
    }
    if (getNumOfOpenCells() + gLevel.mineCount === gLevel.size ** 2) {
        gameOver(true, i, j)
    }

}

function gameOver(didWin, i, j) {
    if (didWin === false) {
        clearInterval(gTimerInterval);
        gTimerInterval = null;
        gBoard[i][j].isExpload = true;
        gGame.isOn = false;
        gGame.livesLeft--;
        gGame.lastCell = BOMB;
        gGame.moves.push({ i, j, move: 'dead' })
        renderEmoji('dead');
    }
    else {
        renderEmoji('win');
        clearInterval(gTimerInterval);
        gTimerInterval = null;
        gGame.lastCell = 'win';
        gGame.isOn = false;
    }

}



function changeLevel(size, mineCount,) {
    gLevel = {
        size,
        mineCount
    }
    renderLevels(size)
    init();

}

function expandShown(iIdx, jIdx) {
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j >= gLevel.size || i === iIdx && j === jIdx) continue;
            var cell = gBoard[i][j];
            if (cell.isShown === false) {
                gGame.shownCount++;
                if (cell.minesAroundCount === 0) {
                    cell.isShown = true;
                    expandShown(i, j);

                }
                gGame.moves.push({ i, j, move: 'expand' });
            }

            cell.isMarked = false;
            cell.isShown = true;
        }
    }

}

function checkNumOfFlags() {
    var flagCount = 0;
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isMarked) flagCount++;

        }
    }
    return flagCount;
}

function undoMove() {
    if (!gGame.moves[0]) { return; }
    gGame.isOn = true;
    renderEmoji('on')
    var lastMove = gGame.moves.pop();
    gGame.shownCount--;

    if (lastMove.move === 'show') {
        gBoard[lastMove.i][lastMove.j].isShown = false

    } else if (lastMove.move === 'dead') {
        gBoard[lastMove.i][lastMove.j].isShown = false
        gBoard[lastMove.i][lastMove.j].isExpload = false
        gGame.livesLeft++
        renderLives();
        renderCheats()


    } else if (lastMove.move === 'expand') {
        gBoard[lastMove.i][lastMove.j].isShown = false
        if (gGame.moves[0] && gGame.moves[gGame.moves.length - 1].move === 'expand') undoMove();
    } else {
        gBoard[lastMove.i][lastMove.j].isMarked = false;
        gGame.shownCount++;
        gGame.markedCount--;
    }
    renderBoard();
}


function getHint(elHint) {
    var optionalPlaces = []
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isShown === false && gBoard[i][j].isMine === false) {
                optionalPlaces.push(gBoard[i][j])
            }
        }
    }
    if (optionalPlaces[0] === null) return
    var randomCell = getRandomIntInclusive(0, optionalPlaces.length - 1)
    optionalPlaces[randomCell].isShown = true;
    renderBoard();
    setTimeout(function () {
        optionalPlaces[randomCell].isShown = false;
        renderBoard();
    }, 3000)

    renderHints(elHint);
}

function toggleCheats() {
    gGame.cheatMode = !gGame.cheatMode;
    renderCheats();
    renderLives();

}

// lost track of the open cell count so decided to build this function
function getNumOfOpenCells() {
    var count = 0;
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isShown === true && gBoard[i][j].isMine === false) count++
        }

    }
    return count;
}
function toggleDirector() {
    if (gGame.moves[0]) return
    gGame.directorOn = true;
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j].isShown = true
        }
    }
    renderDirectorModal()
    renderBoard();
}

function setManualMine(i, j) {
    if (gBoard[i][j].isMine) {
        gBoard[i][j].isMine = false;
        gGame.mineCount--;
        renderBoard();
        renderDirectorModal();
        return
    }
    if (gLevel.mineCount - gGame.mineCount === 0) return
    gGame.mineCount++
    gBoard[i][j].isMine = true;
    renderDirectorModal();
    renderBoard()
}

function intialDirector() {
    if (gLevel.mineCount - gGame.mineCount > 0) return
    hideBoard()
    gGame.isOn = true;
    startTimer();
    setMinesNegsCount()
    gGame.directorOn = false;
    renderDirectorModal()
    renderBoard();
    renderCheats()
    renderLives()
    renderHints()


}

function hideBoard() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j].isShown = false
        }
    }
}