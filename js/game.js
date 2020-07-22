'use strict'
var gCount = 0;
var gRestartButton = {
    on: '😀',
    dead: '😵',
    win: '😎'
}
var BOMB = '💣';
var FLAG = '🕹';
var elRestarBtn = document.querySelector('.restart')

var gBoard;
var gGame;
var gLevel = {
    size: 4,
    mineCount: 2
}

var gTimerInterval;

function init() {
    console.log('starting');
    elRestarBtn.innerText = gRestartButton.on;
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lastCell: null
    }
    renderTimer()
    createBoard()
    setMinesNegsCount()
    renderBoard()
    renderLevels(gLevel.size);

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
    placeMines();
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

function renderLevels(size){
    var elLevels = document.querySelectorAll('.level')
    for(var i =0;i<elLevels.length;i++){
    elLevels[i].style.backgroundColor = '#f9d56e';
    }
    switch(size){
        case 4:
            elLevels[0].style.backgroundColor='#14b1ab';
            break;
        case 8:
            elLevels[1].style.backgroundColor='#14b1ab';
            break;
        case 12:
            elLevels[2].style.backgroundColor='#14b1ab';
            break;
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

function cellMarked(i, j, ev) {
    if (!gGame.isOn || checkNumOfFlags() == gLevel.mineCount) return;
    ev.preventDefault();
    gBoard[i][j].isMarked = true;
    gGame.markedCount++;
    checkGameOver(i, j, false);
    renderBoard();

}

function cellClicked(i, j) {

    if (!gGame.isOn) {
        if (gGame.lastCell === BOMB) {
            return;
        }
        gGame.isOn = true;
        startTimer();
    }
    if (gBoard[i][j].isShown === false) {
        if (checkGameOver(i, j, true) === false) {
            if (gBoard[i][j].minesAroundCount === 0) {
                expandShown(i, j);
            }
            else {
                gGame.shownCount++;
            }
        }
    }
    gBoard[i][j].isMarked = false;
    gBoard[i][j].isShown = true;
    renderBoard();
    checkGameOver(i, j, true);

}

function createCellHTML(i, j) {
    var cell = gBoard[i][j];
    var hidenCell = cell.isMarked == true ? 'cell-mark' : 'cell-hide';
    var className = `cell cell${i}-${j} ${cell.isShown ? 'cell-show' : hidenCell} ${cell.isExpload ? 'cell-expload' : ' '}`;
    var value = cell.isMine ? BOMB : cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
    value = !cell.isShown ? "  " : value;
    return `<td oncontextmenu="cellMarked(${i},${j},event)" onclick="cellClicked(${i},${j},this)" class="${className}">${cell.isMarked && !cell.isShown ? FLAG : value} </td>`

}


function placeMines() {
    var minesCount = 0;
    while (minesCount < gLevel.mineCount) {
        var i = getRandomIntInclusive(0, gLevel.size - 1)
        var j = getRandomIntInclusive(0, gLevel.size - 1)
        if (gBoard[i][j].isMine === false) {
            gBoard[i][j].isMine = true;
            minesCount++
        }
    }
}

function startTimer() {
    gTimerInterval = setInterval(function () {
        gGame.secsPassed += 1;
        renderTimer();
    }, 1000);
}
function renderTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gGame.secsPassed;

}


function checkGameOver(i, j, isLeftClick) {
    if (gBoard[i][j].isMine == true && isLeftClick) {
        clearInterval(gTimerInterval);
        gTimerInterval = null;
        gBoard[i][j].isExpload = true;
        gGame.isOn = false;
        gGame.lastCell = BOMB;
        elRestarBtn.innerText = gRestartButton.dead;
        return true
    }
    if (gGame.shownCount + gLevel.mineCount === gLevel.size ** 2) {
        elRestarBtn.innerText = gRestartButton.win;
        clearInterval(gTimerInterval);
        gTimerInterval = null;
        return true
    }
    return false
}

function showAllCells() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j].isShown = true;
        }
    }
    renderBoard();

}

function changeLevel(size, mineCount, ) {
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
            }
            cell.isMarked = false;
            cell.isShown = true;
        }
    }

}

function checkNumOfFlags(){
    var flagCount =0;
    for(var i=0;i<gLevel.size;i++){
        for (var j = 0;j<gLevel.size;j++){
            if(gBoard[i][j].isMarked) flagCount++;

        }
    }
    console.log(flagCount);
    return flagCount;
}
