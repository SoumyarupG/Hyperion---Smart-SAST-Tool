import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemcForecastErrorComponent } from './remc-forecast-error.component';

describe('RemcForecastErrorComponent', () => {
  let component: RemcForecastErrorComponent;
  let fixture: ComponentFixture<RemcForecastErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemcForecastErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemcForecastErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});