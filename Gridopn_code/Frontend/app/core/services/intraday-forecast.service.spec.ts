import { TestBed } from '@angular/core/testing';

import { IntradayForecastService } from './intraday-forecast.service';

describe('IntradayForecastService', () => {
  let service: IntradayForecastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntradayForecastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
