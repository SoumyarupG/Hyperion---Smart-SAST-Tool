import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Feather Icon
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { CountUpModule } from 'ngx-countup';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbDropdownModule, NgbNavModule, NgbTypeaheadModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';
// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';
// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

//Module
import { DashboardsRoutingModule } from "./dashboards-routing.module";
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataStatusComponent } from './data-status/data-status.component';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';


@NgModule({
  declarations: [
    DashboardComponent,
    // DataStatusComponent
  ],
  imports: [
    CommonModule,
    FeatherModule.pick(allIcons),
    CountUpModule,
    NgbToastModule,
    LeafletModule,
    NgbDropdownModule,
    NgbNavModule,
    SimplebarAngularModule,
    NgApexchartsModule,
    // ADD THIS
    NgxEchartsModule.forRoot({
        echarts: () => import('echarts')
    }),
    SlickCarouselModule ,
    FlatpickrModule.forRoot(),
    DashboardsRoutingModule,
    SharedModule,
    NgbTypeaheadModule,
    NgbPaginationModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule
  ],
  
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class DashboardsModule { }
