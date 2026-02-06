import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenOutagesComponent } from './gen-outages.component';

describe('GenOutagesComponent', () => {
  let component: GenOutagesComponent;
  let fixture: ComponentFixture<GenOutagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenOutagesComponent]
    });
    fixture = TestBed.createComponent(GenOutagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
