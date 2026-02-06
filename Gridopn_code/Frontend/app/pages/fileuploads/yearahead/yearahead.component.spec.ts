import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearaheadComponent } from './yearahead.component';

describe('YearaheadComponent', () => {
  let component: YearaheadComponent;
  let fixture: ComponentFixture<YearaheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [YearaheadComponent]
    });
    fixture = TestBed.createComponent(YearaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
