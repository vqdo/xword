import { Crossword } from './crossword';
import { Tile } from './tile';
import { Position } from './position';
import { Clue, Direction } from './clue';
import { Entry } from './entry';

const BOARD_SIZE = 15;

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

  public previousTile(tile: Tile, direction: Direction) {
    const entry = tile.getEntry(direction);
    const prev = entry.getTileByOffset(tile, -1);
    if (prev) {
      return prev;
    }
    if (direction === 'A') {
      for (let i = tile.position.x - 1; i > 0; i--) {
        tile  = this.getTile({ x: i, y: tile.position.y});
        if (tile.value !== -1) {
          return tile;
        }
      }
    } else if (direction === 'D') {
      for (let i = tile.position.y - 1; i > 0; i--) {
        tile  = this.getTile({ x: tile.position.x, y: i});
        if (tile.value !== -1) {
          return tile;
        }
      }
    }
    return null;
  }

  public nextTile(tile: Tile, direction: Direction) {
    const entry = tile.getEntry(direction);
    const next = entry.getTileByOffset(tile, 1);
    if (next) {
      return next;
    }
    if (direction === 'A') {
      for (let i = tile.position.x + 1; i < BOARD_SIZE; i++) {
        tile  = this.getTile({ x: i, y: tile.position.y});
        if (tile.value !== -1) {
          return tile;
        }
      }
    } else if (direction === 'D') {
      for (let i = tile.position.y + 1; i < BOARD_SIZE; i++) {
        tile  = this.getTile({ x: tile.position.x, y: i});
        if (tile.value !== -1) {
          return tile;
        }
      }
    }
    return null;
  }

  public getTile(position: Position | {x: number, y: number}) {
    return this.board[position.y][position.x];
  }

  private initBoard() {
    this.board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const row = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
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
}
