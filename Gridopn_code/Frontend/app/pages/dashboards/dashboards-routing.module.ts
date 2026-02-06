import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataStatusComponent } from './data-status/data-status.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';

const routes: Routes = [

  //  DEFAULT DASHBOARD ROUTE 
  {
    path: '',
    component: DashboardComponent
  },

  //  EXISTING ROUTE
  {
    path: 'data-status',
    component: DataStatusComponent,
    canActivate: [RoleGuard]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
