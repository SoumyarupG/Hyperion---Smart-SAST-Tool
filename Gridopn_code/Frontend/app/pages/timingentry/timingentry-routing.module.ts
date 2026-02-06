import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { TimingentryPendingComponent } from './timingentry-pending/timingentry-pending.component';
import { ElementPreviousCodesComponent } from './element-previous-codes/element-previous-codes.component';
import { GenOutagesComponent } from './gen-outages/gen-outages.component';
import { PartialOutagesComponent } from './partial-outages/partial-outages.component';

import { RoleGuard } from 'src/app/core/guards/role.guard';

const routes: Routes = [

  {
    path: "pending",
    component: TimingentryPendingComponent,
    canActivate: [RoleGuard],
    data: { allowRoles: ['t_user', 'admin', 'nldc'] }
  },
  {
    path: "previouscodes",
    component: ElementPreviousCodesComponent,
    canActivate: [RoleGuard],
    data: { allowRoles: ['t_user', 'admin', 'nldc'] }
  },
  {
    path: "genoutages",
    component: GenOutagesComponent,
    canActivate: [RoleGuard],
    data: { allowRoles: ['t_user', 'admin'] }
  },
  {
    path: "partialoutages",
    component: PartialOutagesComponent,
    canActivate: [RoleGuard],
    data: { allowRoles: ['t_user', 'admin'] }
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimingEntryRoutingModule { }
