import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tile, Game, Clue } from '@app/models';
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
        this.remoteSync();
      });
  }

  public checkCrossword() {
    if (this.game.check()) {
      alert("Congratulations, its all correct! 🎉")
    } else {
      alert("At least one of your answers is incorrect ❌")
    }
  }

  public showErrors() {
    this.game.showErrors();
  }

  public nextClue() {
    const clues = this.game.selectedClue.direction === 'A' ? this.game.crossword.acrossClues : this.game.crossword.downClues;
    const clueIndex = clues.indexOf(this.game.selectedClue);
    this.game.selectedClue = clues[clueIndex + 1];
  }

  public previousClue() {
    const clues = this.game.selectedClue.direction === 'A' ? this.game.crossword.acrossClues : this.game.crossword.downClues;
    const clueIndex = clues.indexOf(this.game.selectedClue);
    this.game.selectedClue = clues[clueIndex - 1];
  }

  public setSelected(clue: Clue) {
    this.game.selectedClue = clue;

  }

  public updateBoardValue() {
    this.crosswordDataService.sync(this.game).subscribe((game) => {
      for (let i = 0; i < this.game.crossword.height; i++) {
        for (let j = 0; j < this.game.crossword.width; j++) {
          if (game.board[i][j].correct) {
            if (this.game.board[i][j].value == '') {
              this.game.board[i][j].value = game.board[i][j].value;
            }
          }
        }
      }
    });
  }

  public remoteSync() {
    this.updateBoardValue();
    setInterval(() => {
      this.updateBoardValue();
    }, 3000);
  }
}
