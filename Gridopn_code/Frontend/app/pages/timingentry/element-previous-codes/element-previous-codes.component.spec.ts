import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementPreviousCodesComponent } from './element-previous-codes.component';

describe('ElementPreviousCodesComponent', () => {
  let component: ElementPreviousCodesComponent;
  let fixture: ComponentFixture<ElementPreviousCodesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ElementPreviousCodesComponent]
    });
    fixture = TestBed.createComponent(ElementPreviousCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
