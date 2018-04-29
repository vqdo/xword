export class Position {
  constructor(
    public row: number,
    public col: number,
  ) {}

  public isEqualTo(o: Position) {
    return this.row === o.row && this.col === o.col;
  }

  public add(position: {row: number, col: number} | [number, number]) {
    if (position instanceof Array) {
      return new Position(this.row + position[0], this.col + position[1]);
    }
    return new Position(this.row + position.row, this.col + position.col);
  }

  public getOffset(o: Position) {
    return {
      row: o.row - this.row,
      col: o.col - this.col,
    };
  }
}
