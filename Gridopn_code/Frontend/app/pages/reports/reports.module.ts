import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { LineflowsComponent } from './lineflows/lineflows.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlatpickrModule } from 'angularx-flatpickr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MdpComponent } from './mdp/mdp.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScriptsComponent } from './scripts/scripts.component';
import { ToastsContainer } from 'src/app/core/services/toasts-container.component';
import { RemcForecastErrorComponent } from './remc-forecast-error/remc-forecast-error.component';


@NgModule({
  declarations: [
    LineflowsComponent,
    MdpComponent,
    ScriptsComponent,
    RemcForecastErrorComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
    FlatpickrModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    NgSelectModule,
    ToastsContainer
  ]
})
export class ReportsModule { }
