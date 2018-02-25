import { Clue, Direction } from './clue';
import { Position } from './position';
import { Entry } from './entry';

// interface TileEntry {
//   isStartTile: boolean;
//   clue: Clue;
// }

interface TileParams {
  value?: -1 | string;
  position: Position;
}

export class Tile {
  public associatedEntries: Entry[] = [];
  public value: -1 | string = -1;
  public position: Position;

  constructor(args: TileParams) {
    this.setAttributes(args);
  }

  get displayValue(): string {
    return this.value === -1 ? '' : this.value;
  }

  get displayNumber(): string {
    const entry = this.associatedEntries.find((entry) => entry.startTile === this);
    if (entry) {
      return `${entry.clue.number}`;
    }
    return '';
  }

  public setAttributes(args: TileParams) {
    this.value = args.value || -1;
    this.position = new Position(args.position.x, args.position.y);
  }

  public addEntry(entry: Entry) {
    this.associatedEntries.push(entry);
  }

  public getClues(): Clue[] {
    return this.associatedEntries.map((entry: Entry) => entry.clue);
  }

  public getClue(direction: Direction) {
    try {
      return this.getClues().filter((clue) => clue.direction === direction)[0];
    } catch (_) {
      return this.getClues()[0];
    }
  }
}
