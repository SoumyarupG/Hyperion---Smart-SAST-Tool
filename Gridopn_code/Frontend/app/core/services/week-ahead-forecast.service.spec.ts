import { TestBed } from '@angular/core/testing';

import { WeekAheadForecastService } from './week-ahead-forecast.service';

describe('WeekAheadForecastService', () => {
  let service: WeekAheadForecastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeekAheadForecastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
