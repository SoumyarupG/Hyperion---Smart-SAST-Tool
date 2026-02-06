import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWeekaheadComponent } from './view-weekahead.component';

describe('ViewWeekaheadComponent', () => {
  let component: ViewWeekaheadComponent;
  let fixture: ComponentFixture<ViewWeekaheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewWeekaheadComponent]
    });
    fixture = TestBed.createComponent(ViewWeekaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
