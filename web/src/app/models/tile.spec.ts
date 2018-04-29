import { Entry } from './entry';
import { Clue, Direction } from './clue';
import { Position } from './position';
import { Tile } from './tile';

describe('Tile', () => {
  let tile: Tile;
  beforeEach(() => {
    tile = new Tile({ value: 'a', position: new Position(1, 1)});
  });

  describe('.value', () => {
    it('can be set to single letter characters', () => {
      tile.value = 'z';
      expect(tile.value).toBe('z');
    });
    it('can be set to -1', () => {
      tile.value = -1;
      expect(tile.value).toBe(-1);
    });
  });
});
