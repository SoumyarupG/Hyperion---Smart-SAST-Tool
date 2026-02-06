import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DayaheadComponent } from './dayahead/dayahead.component';
import { WeekaheadComponent } from './weekahead/weekahead.component';
import { MonthaheadComponent } from './monthahead/monthahead.component';
import { YearaheadComponent } from './yearahead/yearahead.component';
import { IntradayComponent } from './intraday/intraday.component';

// Component pages


const routes: Routes = [
  {
    path: "intraday",
    component: IntradayComponent
  },
  {
    path: "dayahead",
    component: DayaheadComponent
  },
  {
    path: "weekahead",
    component: WeekaheadComponent
  },
  {
    path: "monthahead",
    component: MonthaheadComponent
  },
  {
    path: "yearahead",
    component: YearaheadComponent
  }
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileuploadsRoutingModule { }
