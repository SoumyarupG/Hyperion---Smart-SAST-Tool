import { TestBed } from '@angular/core/testing';

import { PendingEntriesService } from './pending-entries.service';

describe('PendingEntriesService', () => {
  let service: PendingEntriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingEntriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
