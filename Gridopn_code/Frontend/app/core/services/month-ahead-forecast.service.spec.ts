import { TestBed } from '@angular/core/testing';

import { MonthAheadForecastService } from './month-ahead-forecast.service';

describe('MonthAheadForecastService', () => {
  let service: MonthAheadForecastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthAheadForecastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
