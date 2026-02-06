import { TestBed } from '@angular/core/testing';

import { YearAheadForecastService } from './year-ahead-forecast.service';

describe('YearAheadForecastService', () => {
  let service: YearAheadForecastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YearAheadForecastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
