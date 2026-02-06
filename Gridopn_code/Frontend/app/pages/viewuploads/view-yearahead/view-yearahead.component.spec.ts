import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewYearaheadComponent } from './view-yearahead.component';

describe('ViewYearaheadComponent', () => {
  let component: ViewYearaheadComponent;
  let fixture: ComponentFixture<ViewYearaheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewYearaheadComponent]
    });
    fixture = TestBed.createComponent(ViewYearaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
