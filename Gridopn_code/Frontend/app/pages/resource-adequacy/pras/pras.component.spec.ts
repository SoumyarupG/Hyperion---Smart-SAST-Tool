import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrasComponent } from './pras.component';

describe('PrasComponent', () => {
  let component: PrasComponent;
  let fixture: ComponentFixture<PrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});