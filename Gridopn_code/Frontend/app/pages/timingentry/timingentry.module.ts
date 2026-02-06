import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPaginationModule, NgbToastModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';

// FlatPicker
import { FlatpickrModule } from 'angularx-flatpickr';

// Simplebar
import { SimplebarAngularModule } from 'simplebar-angular';

// Ng Search 
// import { Ng2SearchPipeModule } from 'ng2-search-filter';

// Load Icon
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

// Component pages
import { SharedModule } from '../../shared/shared.module';
import { TimingentryPendingComponent } from './timingentry-pending/timingentry-pending.component'; 

// Sorting page
import{NgbdListSortableHeader} from './timingentry-pending/listjs-sortable.directive'
import { TimingEntryRoutingModule } from './timingentry-routing.module';
import { ToastsContainer } from '../timingentry/timingentry-pending/toasts-container.component';
import { ElementPreviousCodesComponent } from './element-previous-codes/element-previous-codes.component';
import { GenOutagesComponent } from './gen-outages/gen-outages.component';
import { PartialOutagesComponent } from './partial-outages/partial-outages.component'
import { ToastsContainerComponent } from './partial-outages/toasts-container.component';

@NgModule({
  declarations: [
    TimingentryPendingComponent,
    NgbdListSortableHeader,
    ToastsContainer,
    ElementPreviousCodesComponent,
    GenOutagesComponent,
    PartialOutagesComponent,
    ToastsContainerComponent

    
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    FlatpickrModule,
    TimingEntryRoutingModule,
    SharedModule,
    SimplebarAngularModule,
    // Ng2SearchPipeModule,
    NgbToastModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TimingEntryModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
