import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekaheadComponent } from './weekahead.component';

describe('WeekaheadComponent', () => {
  let component: WeekaheadComponent;
  let fixture: ComponentFixture<WeekaheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeekaheadComponent]
    });
    fixture = TestBed.createComponent(WeekaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
