import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimingentryPendingComponent } from './timingentry-pending.component';

describe('TimingentryPendingComponent', () => {
  let component: TimingentryPendingComponent;
  let fixture: ComponentFixture<TimingentryPendingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimingentryPendingComponent]
    });
    fixture = TestBed.createComponent(TimingentryPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
