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
      return this.getNextValidTile(tile.position.add([1, 0]), [1, 0]);
    } else if (direction === 'D') {
      return this.getNextValidTile(tile.position.add([0, 1]), [0, 1]);
    }
    return null;
  }

  public previousTile(tile: Tile, direction: Direction) {
    const prev = tile.getEntry(direction).getTileByOffset(tile, -1);
    if (prev) {
      return prev;
    }
    if (direction === 'A') {
      return this.getNextValidTile(tile.position.add([-1, 0]), [-1, 0]);
    } else if (direction === 'D') {
      return this.getNextValidTile(tile.position.add([0, -1]), [0, -1]);
    }
  }

  private getNextValidTile(position: Position, step: [number, number]) {
    const [xDelta, yDelta] = step;
    let tile = this.getTile(position);
    while (tile) {
      if (tile.value !== -1) {
        return tile;
      }
      position = position.add([xDelta, yDelta]);
      tile = this.getTile(position);
    }
    return null;
  }

  public getTile(position: Position | {x: number, y: number}) {
    return this.board[position.y][position.x];
  }

  private initBoard() {
    this.board = [];
    for (let i = 0; i < this.crossword.height; i++) {
      const row = [];
      for (let j = 0; j < this.crossword.height; j++) {
        row.push(new Tile({
          position: new Position(j, i),
        }));
      }
      this.board.push(row);
    }

    this.populateBoard();
  }

  private populateBoard() {
    this.crossword.clues.forEach((clue) => {
      const tiles = [];
      let [x, y] = [clue.position.x, clue.position.y];
      for (let i = 0; i < clue.tileLength; i++) {
        tiles.push(this.getTile({x, y}));
        if (clue.direction === 'A') {
          x++;
        } else {
          y++;
        }
      }
      const answer = new Entry({ tiles, clue });
    });
  }

  private serializeRow(row: Tile[]): string {
    return row.map((tile) => {
      let rowStr = ''
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
