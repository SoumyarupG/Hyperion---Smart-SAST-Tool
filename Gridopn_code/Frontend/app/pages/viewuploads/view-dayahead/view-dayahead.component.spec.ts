import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDayaheadComponent } from './view-dayahead.component';

describe('ViewDayaheadComponent', () => {
  let component: ViewDayaheadComponent;
  let fixture: ComponentFixture<ViewDayaheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDayaheadComponent]
    });
    fixture = TestBed.createComponent(ViewDayaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
