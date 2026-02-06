import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthaheadComponent } from './monthahead.component';

describe('MonthaheadComponent', () => {
  let component: MonthaheadComponent;
  let fixture: ComponentFixture<MonthaheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthaheadComponent]
    });
    fixture = TestBed.createComponent(MonthaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
