import { Crossword } from './crossword';
import { Tile } from './tile';
import { Position } from './position';
import { Clue, Direction } from './clue';
import { Entry } from './entry';

interface GameParams {
  id: string;
  crossword: Crossword;
}

export class Game {
  public id: string;
  public crossword: Crossword;
  public board: Tile[][];
  public selectedClue: Clue;

  constructor(args: GameParams) {
    Object.assign(this, args);

    this.initBoard();
  }

  public nextTile(tile: Tile, direction: Direction) {
    const next = tile.getEntry(direction).getTileByOffset(tile, 1);
    if (next) {
      return next;
    }
    if (direction === 'A') {
      return this.getNextValidTile(tile.position.add([0, 1]), [0, 1]);
    } else if (direction === 'D') {
      return this.getNextValidTile(tile.position.add([1, 0]), [1, 0]);
    }
    return null;
  }

  public previousTile(tile: Tile, direction: Direction) {
    const prev = tile.getEntry(direction).getTileByOffset(tile, -1);
    if (prev) {
      return prev;
    }
    if (direction === 'A') {
      return this.getNextValidTile(tile.position.add([0, -1]), [0, -1]);
    } else if (direction === 'D') {
      return this.getNextValidTile(tile.position.add([-1, 0]), [-1, 0]);
    }
  }

  private getNextValidTile(position: Position, step: [number, number]) {
    const [rDelta, cDelta] = step;
    let tile = this.getTile(position);
    while (tile) {
      if (tile.value !== -1) {
      console.log('returning tile', tile);
        return tile;
      }
      position = position.add([rDelta, cDelta]);
      tile = this.getTile(position);
    }
    return null;
  }

  public getTile(position: Position | {row: number, col: number}) {
    return this.board[position.row][position.col];
  }

  private initBoard() {
    this.board = [];
    for (let c = 0; c < this.crossword.height; c++) {
      const row = [];
      for (let r = 0; r < this.crossword.height; r++) {
        row.push(new Tile({
          position: new Position(r, c),
        }));
      }
      this.board.push(row);
    }

    this.populateBoard();
  }

  private populateBoard() {
    this.crossword.clues.forEach((clue) => {
      const tiles = [];
      let [row, col] = [clue.position.row, clue.position.col];
      for (let i = 0; i < clue.tileLength; i++) {
        tiles.push(this.getTile({row, col}));
        if (clue.direction === 'A') {
          col++;
        } else {
          row++;
        }
      }
      const answer = new Entry({ tiles, clue });
    });
  }

  private serializeRow(row: Tile[]): string {
    return row.map((tile) => {
      let rowStr = '';
      if (tile.value === -1) {
        rowStr += '#';
      } else if (tile.value === '') {
        rowStr += ' ';
      } else {
        if (tile.correct) {
          rowStr += tile.value;
        } else {
          rowStr += ' ';
        }
      }
      return rowStr;
    }).join('');
  }

  public serializeBoard(): string {
    return this.board.map((row) => this.serializeRow(row)).join('');
  }

  public deserializeBoard(boardStr: string) {
    if (boardStr.length !== this.crossword.height * this.crossword.width) {
      throw Error('incorrectly formatted board string');
    }

    for (let i = 0; i < boardStr.length; i++) {
      const str = boardStr.charAt(i);
      if (str !== ' ' && str !== '#') {
        const row = Math.floor(i / this.crossword.width);
        const col = i % this.crossword.width;
        const tile = this.board[row][col];
        if (tile.value === '') {
          tile.value = str;
        }
      }
    }
  }
}
