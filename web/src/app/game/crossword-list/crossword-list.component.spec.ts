import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrosswordListComponent } from './crossword-list.component';

describe('CrosswordListComponent', () => {
  let component: CrosswordListComponent;
  let fixture: ComponentFixture<CrosswordListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrosswordListComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrosswordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
