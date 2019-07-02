import * as P5 from 'p5';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const cols = 9;
const rows = cols;

const width = 450;
const height = width;

const blockSize = width / cols;

const board = [];
const rawBoard = [];

const zip = new JSZip();
const img = zip.folder('img');
const data = zip.folder('data');

let canvas;

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c == 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

const index = (p) => {
  const randomSudokuNumber = () => Math.floor(Math.random() * rows + 1);

  const drawNumber = (col, row, number) => {
    const x = col * blockSize + blockSize / 2;
    const y = row * blockSize + blockSize / 2;
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(number, x, y);
    // p.fill(0, 102, 153);
  };

  const field = (x, y, val) => {
    const col = x;
    const row = y;
    const value = val;
    return {
      getRow: () => board[row].map(block => block.getVal()),
      getCol: () => {
        const colArr = new Array(cols);
        for (let i = 0; i < cols; i++) {
          colArr[i] = board[i][col].getVal();
        }
        return colArr;
      },
      getVal: () => value,
    };
  };

  const setupBoard = () => {
    board.length = 0;
    rawBoard.length = 0;
    for (let x = 0; x < cols; x++) {
      board[x] = new Array(rows);
      rawBoard[x] = new Array(rows);
    }
  };

  const drawThickBorders = () => {
    p.strokeWeight(8);
    p.line(0, 0, 0, width);
    p.line(0, 0, width, 0);
    p.line(width, 0, width, width);
    p.line(0, width, width, width);
    p.strokeWeight(3);
    p.line(0, blockSize * 3, width, blockSize * 3);
    p.line(0, blockSize * 6, width, blockSize * 6);
    p.line(blockSize * 3, 0, blockSize * 3, width);
    p.line(blockSize * 6, 0, blockSize * 6, width);
    p.strokeWeight(1);
  };

  const setupGrid = () => {
    const uuid = uuidv4();

    setupBoard();
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        p.square(x * blockSize, y * blockSize, blockSize);
        const number = randomSudokuNumber();
        const keepEmpty = randomSudokuNumber() < 8;
        if (keepEmpty) {
          drawNumber(x, y, number);
        }
        board[y][x] = field(x, y, number);
        rawBoard[y][x] = keepEmpty ? number : undefined;
      }
    }
    drawThickBorders();

    const canv = document.getElementById('defaultCanvas0');
    canv.toBlob((blob) => {
      img.file(`${uuid}.png`, blob);
    }, 'image/jpeg', 0.95);


    // img.save(`${uuid}.png`);
    data.file(`${uuid}.json`, JSON.stringify(rawBoard));
  };


  p.setup = () => {
    canvas = p.createCanvas(width, height);
    setupGrid();
    console.log(board);
    console.log('val =>', board[0][0].getVal());
    console.log('row =>', board[0][0].getRow());
    console.log('col =>', board[0][0].getCol());
    console.log(rawBoard);
  };

  const regen = () => {
    console.log('was');
    setupGrid();
    p.redraw();
  };

  document.getElementById('generate').addEventListener('click', () => {
    const iterations = parseInt(document.getElementById('gen-num').value, 10);
    for (let i = 0; i < iterations; i++) {
      regen();
    }
  });
};

document.getElementById('download').addEventListener('click', () => {
  zip.generateAsync({ type: 'blob' }).then((content) => {
    // see FileSaver.js
    saveAs(content, 'sudoku.zip');
  });
});

console.log('loading minesweeperGenerator...');
const myp5 = new P5(index);
