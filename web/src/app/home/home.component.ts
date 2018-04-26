import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrosswordDataService } from '@services/crossword-data.service';
import { Game, Crossword } from '@app/models';

import 'rxjs/add/operator/first';

@Component({
  selector: 'xw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {

  constructor(
    private router: Router,
    private crosswordDataService: CrosswordDataService,
  ) { }

  public createNewGame(crosswordId) {
    this.crosswordDataService.createNewGame(crosswordId).first().subscribe({
      next: (game: Game) => {
        this.router.navigate(['game', game.id]);
      },
      error: (res) => {
        console.error('error creating game', res);
      },
    });
  }

}
