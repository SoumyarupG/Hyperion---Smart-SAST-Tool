import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialOutagesComponent } from './partial-outages.component';

describe('PartialOutagesComponent', () => {
  let component: PartialOutagesComponent;
  let fixture: ComponentFixture<PartialOutagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartialOutagesComponent]
    });
    fixture = TestBed.createComponent(PartialOutagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
