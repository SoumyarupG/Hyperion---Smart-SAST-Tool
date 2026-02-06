import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ResourceAdequacyRoutingModule } from './resource-adequacy-routing.module';
import { PrasComponent } from './pras/pras.component';
import { SharedModule } from '../../shared/shared.module';
import { FlatpickrModule } from 'angularx-flatpickr';
import { ToastsContainer } from 'src/app/core/services/toasts-container.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
// Ck Editer
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask, IConfig } from 'ngx-mask';
// Ngx Sliders
import { NgxSliderModule } from 'ngx-slider-v2';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
// Auto Complate
import {AutocompleteLibModule} from 'angular-ng-autocomplete';

// import { defineElement } from "@lordicon/element";
import lottie from 'lottie-web';
import { defineElement } from 'lord-icon-element';
import { ShareAllocationComponent } from './share-allocation/share-allocation.component';

@NgModule({
  declarations: [
    PrasComponent,
    ShareAllocationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    SharedModule,
    ResourceAdequacyRoutingModule,
    FlatpickrModule.forRoot(),
    ToastsContainer,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbNavModule,
    NgSelectModule,
    UiSwitchModule,
    FlatpickrModule,
    ColorPickerModule,
    NgxMaskDirective, 
    NgxMaskPipe,
    NgxSliderModule,
    CdkStepperModule,
    NgStepperModule,
    CKEditorModule,
    DropzoneModule,
    AutocompleteLibModule,
    
  ],
  providers:[
    provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResourceAdequacyModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
 }