import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LineflowsComponent } from './lineflows/lineflows.component';
import { MdpComponent } from './mdp/mdp.component';
import { ScriptsComponent } from './scripts/scripts.component';
import { RemcForecastErrorComponent } from './remc-forecast-error/remc-forecast-error.component';

const routes: Routes = [
  { path: 'lineflows', component: LineflowsComponent },
  { path: 'mdp', component: MdpComponent },
  { path: 'scripts', component: ScriptsComponent },
  { path: 'remc-forecast-error', component: RemcForecastErrorComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
