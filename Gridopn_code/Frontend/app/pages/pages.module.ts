import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbToastModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';
import { CountUpModule } from 'ngx-countup';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { LightboxModule } from 'ngx-lightbox';

// Load Icons
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

// Pages Routing
import { PagesRoutingModule } from "./pages-routing.module";
import { SharedModule } from "../shared/shared.module";
import { DashboardComponent } from './dashboards/dashboard/dashboard.component';
import { DashboardsModule } from "./dashboards/dashboards.module";
import { DayaheadComponent } from './fileuploads/dayahead/dayahead.component';
import { FileuploadsModule } from './fileuploads/fileuploads.module';
import { ViewFileuploadsModule } from './viewuploads/viewuploads.module';
import { TimingEntryModule } from './timingentry/timingentry.module';
import { ReportsModule } from './reports/reports.module';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [
    // DashboardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlatpickrModule.forRoot(),
    CountUpModule,
    NgApexchartsModule,
     NgxEchartsModule.forRoot({
    echarts: () => import('echarts')
  }),
    LeafletModule,
    NgbDropdownModule,
    SimplebarAngularModule,
    PagesRoutingModule,
    SharedModule,
    SlickCarouselModule ,
    LightboxModule,
    DashboardsModule,
    FileuploadsModule,
    ViewFileuploadsModule,
    TimingEntryModule,
    ReportsModule
  ],
  providers: [
      {
          provide: NGX_ECHARTS_CONFIG,
          useValue: { echarts: () => import('echarts') }
      }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule { 
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
