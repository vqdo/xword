import { Clue, Direction } from './clue';
import { Position } from './position';
import { Entry } from './entry';

interface TileParams {
  value?: -1 | string;
  position: Position;
}

export class Tile {
  public associatedEntries: Entry[] = [];
  public position: Position;
  public correct: boolean = false;

  private _value: -1 | string = -1;

  constructor(args: TileParams) {
    this.setAttributes(args);
  }

  get displayValue(): string {
    return this.value === -1 ? '' : this.value;
  }

  get displayNumber(): string {
    const entry = this.associatedEntries.find((e) => e.startTile === this);
    if (entry) {
      return `${entry.clue.number}`;
    }
    return '';
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
    this.checkValue();
  }

  public setAttributes(args: TileParams) {
    this.value = args.value || -1;
    this.position = new Position(args.position.row, args.position.col);
  }

  public addEntry(entry: Entry) {
    this.associatedEntries.push(entry);
  }

  public getEntry(direction: Direction) {
    return this.associatedEntries.filter((entry) => entry.clue.direction === direction)[0];
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

  private checkValue() {
    this.correct = this.associatedEntries.every((entry) => entry.checkTile(this));
  }
}
