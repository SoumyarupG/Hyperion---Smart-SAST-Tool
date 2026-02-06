import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrasComponent } from './pras/pras.component';
import { ShareAllocationComponent } from './share-allocation/share-allocation.component';

const routes: Routes = [
  {
    path: 'pras',
    component: PrasComponent
  },
  {
    path: 'share-allocation',
    component: ShareAllocationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceAdequacyRoutingModule { }