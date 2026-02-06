import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntradayComponent } from './intraday.component';

describe('IntradayComponent', () => {
  let component: IntradayComponent;
  let fixture: ComponentFixture<IntradayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntradayComponent]
    });
    fixture = TestBed.createComponent(IntradayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
