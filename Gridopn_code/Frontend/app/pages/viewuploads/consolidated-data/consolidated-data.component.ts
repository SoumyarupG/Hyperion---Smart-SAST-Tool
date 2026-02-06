import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ReportsService } from 'src/app/core/services/reports.service';
import { ToastService } from 'src/app/core/services/toast-service';

@Component({
  selector: 'app-consolidated-data',
  templateUrl: './consolidated-data.component.html',
  styleUrls: ['./consolidated-data.component.scss']
})
export class ConsolidatedDataComponent {
  validationform!: UntypedFormGroup;
  submit = false;
  loading = false;
  isSingleDate = false;

  breadCrumbItems!: Array<{}>;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private reportService: ReportsService,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Consolidated Data' },
      { label: 'Download Data', active: true }
    ];

    this.validationform = this.formBuilder.group({
      type: ['', Validators.required],
      dateRange: [''],
      singleDate: ['']
    });
  }

  get form() {
    return this.validationform.controls;
  }

  onTypeChange() {
    const type = this.validationform.get('type')?.value;

    if (type === 'day') {
      this.isSingleDate = true;
      this.validationform.get('dateRange')?.clearValidators();
      this.validationform.get('singleDate')?.setValidators([Validators.required]);
    } else {
      this.isSingleDate = false;
      this.validationform.get('singleDate')?.clearValidators();
      this.validationform.get('dateRange')?.setValidators([Validators.required]);
    }

    this.validationform.get('singleDate')?.updateValueAndValidity();
    this.validationform.get('dateRange')?.updateValueAndValidity();
  }

  formatDate(d: any): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
  }

downloadConsolidatedFile() {
  this.submit = true;

  if (this.validationform.invalid) {
    this.toastService.show('Please fill all required fields correctly.', { classname: 'bg-danger text-white', delay: 3000 });
    return;
  }

  this.loading = true;

  const type = this.validationform.get('type')?.value;
  let from_date = '';
  let to_date = '';

  if (type === 'day') {
    from_date = to_date = this.validationform.get('singleDate')?.value;
  } else {
    const range = this.validationform.get('dateRange')?.value;
    from_date = range?.from || range?.[0];
    to_date = range?.to || range?.[1];
  }

  const body = { type, from_date, to_date };

  this.reportService.downloadConsolidatedFile(body).subscribe({
    next: (response: Blob) => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const formattedFrom = this.formatDate(from_date);
      const formattedTo = this.formatDate(to_date);

      const filename = type === 'day'
        ? `Consolidated_${type}_${formattedFrom}.xlsx`
        : `Consolidated_${type}_${formattedFrom}_to_${formattedTo}.xlsx`;

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);

      this.toastService.show('File downloaded successfully!', { classname: 'bg-success text-white', delay: 3000 });
      this.loading = false;
    },
    error: (err) => {
      // ✅ Show backend message (example: "Missing uploads from: TN, KER")
      const msg = err?.error?.message || 'Error downloading file.';
      this.toastService.show(msg, { classname: 'bg-danger text-white', delay: 3000 });

      this.loading = false; // ✅ Stop loader
      this.submit = false;  // ✅ Enable re-submit
    }
  });
}

}
