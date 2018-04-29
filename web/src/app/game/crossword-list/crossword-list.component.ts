import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CrosswordDataService } from '@services/crossword-data.service';

@Component({
  selector: 'xw-crossword-list',
  templateUrl: './crossword-list.component.html',
  styleUrls: ['./crossword-list.component.scss'],
})
export class CrosswordListComponent implements OnInit {
  @Output() public crosswordClicked = new EventEmitter<string>();

  public crosswordIds: string[] = [];
  constructor(
    private crosswordDataService: CrosswordDataService,
  ) { }

  public ngOnInit() {
    this.getCrosswords();
  }

  public getCrosswords() {
    this.crosswordDataService.getPuzzles().subscribe((crosswordIds: string[]) => {
      this.crosswordIds = crosswordIds;
    });
  }

}
