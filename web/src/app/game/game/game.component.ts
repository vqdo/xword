import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game, Clue } from '@app/models';
import { CrosswordDataService } from '@services/crossword-data.service';

@Component({
  selector: 'xw-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  public game: Game;
  constructor(
    private crosswordDataService: CrosswordDataService,
    private route: ActivatedRoute,
  ) { }

  public ngOnInit() {
    this.route.params
      .switchMap((params) => {
        const { id } = params;
        return this.crosswordDataService.getGame(id);
      })
      .subscribe((game) => {
        this.game = game;
      });
  }

  public setSelected(clue: Clue) {
    this.game.selectedClue = clue;
  }

}
