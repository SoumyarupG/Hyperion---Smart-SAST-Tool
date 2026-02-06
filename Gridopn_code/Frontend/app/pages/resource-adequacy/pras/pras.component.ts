import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';

@Component({
  selector: 'app-pras',
  templateUrl: './pras.component.html',
  styleUrls: ['./pras.component.scss']
})
export class PrasComponent implements OnInit {

  prasForm!: FormGroup;
  submitted = false;
  validationSuccess = false;
  userData: any;

  uploadedFiles: any = {
    gencore: null,
    gencapacity: null,
    regionsload: null
  };

  fileConfigs = [
    { key: 'gencore', label: 'Gen Core' },
    { key: 'gencapacity', label: 'Gen Capacity' },
    { key: 'regionsload', label: 'Regions Load' }
  ];

  breadCrumbItems = [
    { label: 'Resource Adequacy' },
    { label: 'PRAS', active: true }
  ];

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {

    this.userData = this.tokenStorage.getUser();

    this.prasForm = this.fb.group({
      state: ['', Validators.required],
      monthRange: [null, Validators.required],
      mcRuns: [
        1000,
        [Validators.required, Validators.min(1), Validators.max(10000)]
      ]
    });

    if (this.userData?.role === 'f_user') {
      this.prasForm.get('state')?.setValue(this.userData.state_id);
      this.prasForm.get('state')?.disable();
    }
  }

  get form() {
    return this.prasForm.controls;
  }

  get canValidate(): boolean {

    const formValid = this.prasForm.valid;
    const monthValid = this.validateMonthRange();
    const filesValid = this.validateFiles();

    // console.log('--- PRAS VALIDATION DEBUG ---');
    // console.log('Form Valid       :', formValid);
    // console.log('Month Valid      :', monthValid);
    // console.log('Files Valid      :', filesValid);
    // console.log('Month Range Value:', this.prasForm.get('monthRange')?.value);
    // console.log('Uploaded Files   :', this.uploadedFiles);
    // console.log('-----------------------------');

    return formValid && monthValid && filesValid;
  }


  onFileChange(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles[key] = file;
    }
  }
  

  downloadFormat(type: string) {
    this.toastService.show(
      `Downloading ${type} format`,
      { classname: 'bg-info text-white', delay: 3000 }
    );
  }

  validateFiles(): boolean {
    return Object.values(this.uploadedFiles).every(f => !!f);
  }



  //  public
  validateMonthRange(): boolean {
    const range = this.prasForm.get('monthRange')?.value;

    if (!range) return false;

    let from: Date;
    let to: Date;

    //  CASE 1: flatpickr returns array
    if (Array.isArray(range) && range.length === 2) {
      from = new Date(range[0]);
      to = new Date(range[1]);
    }

    //  CASE 2: flatpickr returns object
    else if (range.from && range.to) {
      from = new Date(range.from);
      to = new Date(range.to);
    }

    //  CASE 3: flatpickr returns string (YOUR CURRENT CASE)
    else if (typeof range === 'string' && range.includes('to')) {
      const parts = range.split('to').map(p => p.trim());
      if (parts.length !== 2) return false;

      from = new Date(parts[0]);
      to = new Date(parts[1]);
    }

    else {
      return false;
    }

    //  Full month validation
    const firstDay = new Date(to.getFullYear(), to.getMonth(), 1);
    const lastDay = new Date(from.getFullYear(), from.getMonth() + 1, 0);

    return (
      from.getTime() === firstDay.getTime() &&
      to.getTime() === lastDay.getTime()
    );
  }







  validateAndStore() {
    this.submitted = true;

    if (!this.canValidate) {
      this.toastService.show(
        'Please fix validation errors',
        { classname: 'bg-danger text-white', delay: 4000 }
      );
      return;
    }

    // 🔗 API call to validate & store

    this.validationSuccess = true;

    this.toastService.show(
      'Data validated and stored successfully',
      { classname: 'bg-success text-white', delay: 4000 }
    );
  }

  runRA() {
    this.toastService.show(
      `Running Resource Adequacy with ${this.prasForm.value.mcRuns} runs`,
      { classname: 'bg-success text-white', delay: 4000 }
    );

    // 🔗 Trigger Julia PRAS execution
  }
}
