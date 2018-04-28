import { ActivatedRoute } from '@angular/router';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MockActivatedRoute } from '@testing/mocks/mock-activated-route';

import { CrosswordDataService } from '@services/crossword-data.service';

import { StickyDirective } from '@app/shared/directives/sticky.directive';

import { GameComponent } from './game.component';
import { TileComponent } from '@app/game/tile/tile.component';
import { BoardComponent } from '@app/game/board/board.component';
import { ClueListComponent } from '@app/game/clue-list/clue-list.component';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let activeRoute: MockActivatedRoute;

  beforeEach(() => {
    activeRoute = new MockActivatedRoute();
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ClueListComponent,
        GameComponent,
        BoardComponent,
        StickyDirective,
        TileComponent,
      ],
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activeRoute },
        CrosswordDataService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    activeRoute.testParams = { id: 1234 };
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
