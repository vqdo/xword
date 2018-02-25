import { Tile } from './tile';
import { Position } from './position';
import { Clue, Direction } from './clue';

interface EntryParams {
  tiles: Tile[];
  clue: Clue;
}

export class Entry {
  public tiles: Tile[];
  public clue: Clue;

  constructor(args: EntryParams) {
    Object.assign(this, args);

    this.tiles.forEach((tile) => {
      tile.value = '';
      tile.addEntry(this);
    });
  }

  get currentEntry(): string {
    return this.tiles.reduce((word, tile) => word + tile.displayValue, '');
  }

  get isComplete() {
    return !this.tiles.some((tile) => tile.value === '');
  }

  get startTile() {
    return this.tiles[0];
  }

  get correct() {
    return this.clue.answer === this.currentEntry;
  }

  public checkTile(tile) {
    const i = this.tiles.indexOf(tile);
    if (i < 0) {
      throw Error('Invalid tile');
    }
    return this.clue.answer.charAt(i) === tile.value;
  }
}
