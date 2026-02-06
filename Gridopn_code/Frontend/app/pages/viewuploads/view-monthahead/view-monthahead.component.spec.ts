import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMonthaheadComponent } from './view-monthahead.component';

describe('ViewMonthaheadComponent', () => {
  let component: ViewMonthaheadComponent;
  let fixture: ComponentFixture<ViewMonthaheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewMonthaheadComponent]
    });
    fixture = TestBed.createComponent(ViewMonthaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
