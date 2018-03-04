import { Component, EventEmitter, Input, Output, OnChanges, OnInit } from '@angular/core';
import { Clue } from '@app/models/clue';

@Component({
  selector: 'xw-clue-list',
  templateUrl: './clue-list.component.html',
  styleUrls: ['./clue-list.component.scss'],
})
export class ClueListComponent implements OnInit, OnChanges {
  @Input() public clues: Clue[] = [];
  @Input() public selectedClue: Clue;
  @Input() public title: string = '';
  @Output() public clueSelect = new EventEmitter<Clue>();
  public isActive: boolean = false;
  constructor() { }

  public ngOnInit() {
  }

  public ngOnChanges(changes) {
    if (changes.selectedClue) {
      this.isActive = this.clues.indexOf(this.selectedClue) > -1;
    }
  }

  public onClueSelect(clue: Clue) {
    this.clueSelect.emit(clue);
  }
}
