export class Position {
  constructor(
    public x: number,
    public y: number,
  ) {}

  public isEqualTo(o: Position) {
    return this.x === o.x && this.y === o.y;
  }

  public add(position: {x: number, y: number} | [number, number]) {
    if (position instanceof Array) {
      return new Position(this.x + position[0], this.y + position[1]);
    }
    return new Position(this.x + position.x, this.y + position.y);
  }

  public getOffset(o: Position) {
    return {
      x: o.x - this.x,
      y: o.y - this.y,
    };
  }
}
