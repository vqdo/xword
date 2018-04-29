import { Position } from './position';

export type Direction = 'A' | 'D';

interface ClueParams {
  number: number;
  position: {row: number, col: number};
  tileLength: number;
  hint: string;
  direction: Direction;
  answer: string;
}

export class Clue {
  public number: number;
  public direction: Direction;
  public position: Position;
  public tileLength: number;
  public hint: string;
  public answer: string;

  constructor(args: ClueParams) {
    Object.assign(this, args);
    this.position = new Position(args.position.row, args.position.col);
  }
}
