import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from "./dashboards/dashboard/dashboard.component";
import { RoleGuard } from '../core/guards/role.guard';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [

 {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
  },

  {
    path: 'fileuploads',
    loadChildren: () =>
      import('./fileuploads/fileuploads.module').then(m => m.FileuploadsModule),

  },

  {
    path: 'viewuploads',
    loadChildren: () =>
      import('./viewuploads/viewuploads.module').then(m => m.ViewFileuploadsModule)
  },

  {
    path: 'timingentry',
    loadChildren: () =>
      import('./timingentry/timingentry.module').then(m => m.TimingEntryModule),

  },

  {
    path: 'reports',
    loadChildren: () =>
      import('./reports/reports.module').then(m => m.ReportsModule),

  },

  {
    path: 'resource-adequacy',
    loadChildren: () =>
      import('./resource-adequacy/resource-adequacy.module').then(m => m.ResourceAdequacyModule)
  },
  {
      path: 'errors',
      loadChildren: () =>
        import('../account/auth/errors/errors.module').then(m => m.ErrorsModule)
    }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
