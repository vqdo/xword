import { TestBed, inject } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CrosswordDataService } from './crossword-data.service';

describe('CrosswordDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        CrosswordDataService,
      ],
    });
  });

  it('should be created', inject([CrosswordDataService], (service: CrosswordDataService) => {
    expect(service).toBeTruthy();
  }));
});
