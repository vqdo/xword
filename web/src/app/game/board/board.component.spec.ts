import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardComponent } from './board.component';
import { TileComponent } from '@app/game/tile/tile.component';

import { Game } from '@app/models/game';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BoardComponent,
        TileComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    // TODO: need to mock crossword
    // component.game = new Game({ id: 'abc', crossword: null });
    // fixture.detectChanges();
  });

  it('should create', () => {
    // TODO:
  });
});
