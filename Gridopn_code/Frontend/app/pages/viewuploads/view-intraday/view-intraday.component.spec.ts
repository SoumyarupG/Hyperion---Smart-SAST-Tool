import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIntradayComponent } from './view-intraday.component';

describe('ViewIntradayComponent', () => {
  let component: ViewIntradayComponent;
  let fixture: ComponentFixture<ViewIntradayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewIntradayComponent]
    });
    fixture = TestBed.createComponent(ViewIntradayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
