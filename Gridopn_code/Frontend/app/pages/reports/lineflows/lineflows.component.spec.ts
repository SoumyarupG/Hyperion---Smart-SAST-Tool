import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineflowsComponent } from './lineflows.component';

describe('LineflowsComponent', () => {
  let component: LineflowsComponent;
  let fixture: ComponentFixture<LineflowsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LineflowsComponent]
    });
    fixture = TestBed.createComponent(LineflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
