import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrosswordDataService } from '@services/crossword-data.service';
import { Game, Crossword } from '@app/models';

import 'rxjs/add/operator/first';

@Component({
  selector: 'xw-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private router: Router,
  ) { }
}
