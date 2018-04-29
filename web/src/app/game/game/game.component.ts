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
      });
  }

  public setSelected(clue: Clue) {
    this.game.selectedClue = clue;

  }

  public syncBoard() {
    this.crosswordDataService.sync(this.game).subscribe((game) => {
      this.game = game;
    });
  }

<<<<<<< HEAD
  public updateBoardValue() {
    this.crosswordDataService.sync(this.game).subscribe((game) => {
      for (let i = 0; i < this.game.crossword.height; i++) {
        for (let j = 0; j < this.game.crossword.width; j++) {
          this.game.board[i][j].value = game.board[i][j].value;
        }
      }
    });
  }

  public remoteSync() {
    this.syncBoard();
    setInterval(() => {
      this.updateBoardValue();
    }, 500);
=======
  public sync() {
    this.crosswordDataService.sync(this.game).subscribe((game) => {
      this.game = game;
    });
  }

  public updateGameId() {
    const gameId = document.getElementById('gameId').innerHTML;
    this.game.id = gameId;
>>>>>>> b5279bcd792ce6fff939e7fc1614de1a38f1fefd
  }
}
