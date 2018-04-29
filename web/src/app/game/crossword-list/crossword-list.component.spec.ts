import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CrosswordListComponent } from './crossword-list.component';
import { CrosswordDataService } from '@services/crossword-data.service';

describe('CrosswordListComponent', () => {
  let component: CrosswordListComponent;
  let fixture: ComponentFixture<CrosswordListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrosswordListComponent ],
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        CrosswordDataService,
      ],
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
