
import { Component } from '@angular/core';
import { ReportsService } from 'src/app/core/services/reports.service';
import { ToastService } from 'src/app/core/services/toast-service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-scripts',
  templateUrl: './scripts.component.html',
  styleUrls: ['./scripts.component.scss']
})
export class ScriptsComponent {
  submit = false;
  get f() {
    return this.forecastForm.controls;
  }
  // Breadcrumb items for navigation
  breadCrumbItems!: Array<{}>;
  // Loading state for merged mail button
  loadingMerged = false;
  // Loading state for forecast mail button
  loadingForecast = false;
  // Form group for forecast mail section
  forecastForm!: UntypedFormGroup;

  isSingleDate = true;

  // Inject services for API calls, form building, and toast notifications
  constructor(
    private reportsService: ReportsService,
    private fb: UntypedFormBuilder,
    public toastService: ToastService
  ) {}

  // Initialize breadcrumb and form controls
  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Reports' },
      { label: 'Custom Scripts', active: true }
    ];
    this.forecastForm = this.fb.group({
      type: ['day', Validators.required],
      dayRange: [null],
      singleDate: [null]
    });

  }

  /**
   * Trigger merged demand forecast mail (uses Toast for notification)
   */
  sendMergedForecastMail() {
    this.loadingMerged = true;
    this.reportsService.sendMergedDemandForecastMail().subscribe((res: any) => {
      this.loadingMerged = false;
      if(res["status"] == "failure") {
        this.toastService.show('Problem in running the script!', { classname: 'bg-danger text-white', delay: 3000 });
      } else {
        this.toastService.show(res['message'], { classname: 'bg-success text-white', delay: 3000 });
      }
    });
  }

  /**
   * Trigger forecast mail for selected type and date range (uses Toast for notification)
   */
  sendForecastMail() {
    this.submit = true;

    if (this.forecastForm.invalid) {
      return;
    }

    this.loadingForecast = true;

    const type = this.forecastForm.value.type;
    let from_date = '';
    let to_date = '';

    const toYMD = (d: Date) =>
      `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;

    if (type === 'day') {
      const d = new Date(this.forecastForm.value.singleDate);
      from_date = to_date = toYMD(d);
    } else {
      const r = this.forecastForm.value.dayRange;
      from_date = toYMD(new Date(r.from || r[0]));
      to_date   = toYMD(new Date(r.to || r[1]));
    }

    this.reportsService.sendForecastMailApi({ type, from_date, to_date })
      .subscribe({
        next: (res: any) => {
          this.loadingForecast = false;
          if (res.status === 'failure') {
            this.toastService.show(res.message, { classname: 'bg-danger text-white', delay: 4000 });
          } else {
            this.toastService.show(res.result, { classname: 'bg-success text-white', delay: 4000 });
          }
        },
        error: () => {
          this.loadingForecast = false;
          this.toastService.show('API error', { classname: 'bg-danger text-white', delay: 3000 });
        }
      });
  }


    onTypeChange() {
    const type = this.forecastForm.value.type;

    if (type === 'day') {
      this.isSingleDate = true;
      this.f['singleDate'].setValidators([Validators.required]);
      this.f['dayRange'].clearValidators();
      this.f['dayRange'].reset();
    } else {
      this.isSingleDate = false;
      this.f['dayRange'].setValidators([Validators.required]);
      this.f['singleDate'].clearValidators();
      this.f['singleDate'].reset();
    }

    this.f['singleDate'].updateValueAndValidity();
    this.f['dayRange'].updateValueAndValidity();
  }
}
