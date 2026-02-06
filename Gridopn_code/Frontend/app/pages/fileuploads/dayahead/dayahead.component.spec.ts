import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayaheadComponent } from './dayahead.component';

describe('DayaheadComponent', () => {
  let component: DayaheadComponent;
  let fixture: ComponentFixture<DayaheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DayaheadComponent]
    });
    fixture = TestBed.createComponent(DayaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
