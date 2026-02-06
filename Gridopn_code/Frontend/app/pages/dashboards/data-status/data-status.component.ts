import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from 'src/app/core/services/toast-service';
import { ToastsContainer } from 'src/app/core/services/toasts-container.component';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlatpickrModule } from 'angularx-flatpickr';
import { DashboardService } from 'src/app/core/services/dashboard.service';

@Component({
  selector: 'app-data-status',
  templateUrl: './data-status.component.html',
  styleUrls: ['./data-status.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    ToastsContainer,
    FlatpickrModule
  ]
})
export class DataStatusComponent implements OnInit {

  breadCrumbItems!: Array<{}>;
  userData: any;

  dataStatusForm!: FormGroup;
  stateWiseForm!: FormGroup;

  submitDaily = false;   // ✔ FIXED
  submitState = false;   // ✔ FIXED

  loading = false;

  selectedOption: string = 'dailystatus';

  tableData: any[] = [];
  columns: string[] = [];

  stateWiseData: any[] = [];
  stateWiseColumns: string[] = [];

  states = [
    { id: 1, name: 'Karnataka' },
    { id: 2, name: 'Tamilnadu' },
    { id: 3, name: 'Telangana' },
    { id: 4, name: 'Andhra Pradesh' },
    { id: 5, name: 'Kerala' },
    { id: 7, name: 'Pondicherry' }
  ];

  dataTypes = [
    { value: 'dayahead', label: 'Day Ahead' },
    { value: 'weekahead', label: 'Week Ahead' },
    { value: 'monthahead', label: 'Month Ahead' },
    { value: 'yearahead', label: 'Year Ahead' },
    { value: 'intraday', label: 'Intraday' }
  ];

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private tokenStorage: TokenStorageService,
    public toastService: ToastService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userData = this.tokenStorage.getUser();

    this.breadCrumbItems = [
      { label: 'Dashboards' },
      { label: 'Data Status', active: true }
    ];

    this.dataStatusForm = this.fb.group({
      state: ['', Validators.required],
      dataType: ['', Validators.required],
      dateRange: [null, Validators.required]
    });

    this.stateWiseForm = this.fb.group({
      dataType: ['', Validators.required],
      dateRange: [null, Validators.required]
    });
  }

  get f() {
    return this.dataStatusForm.controls;
  }

  get sf() {
    return this.stateWiseForm.controls;
  }

  onTabChange(option: string): void {
    this.selectedOption = option;

    // reset validation states when switching tabs
    this.submitDaily = false;
    this.submitState = false;
  }

  fetchData(): void {
    this.submitDaily = true;
    if (this.dataStatusForm.invalid) return;

    this.loading = true;

    const formVal = this.dataStatusForm.value;
    const range = formVal.dateRange;

    const formData = {
      state: formVal.state,
      dataType: formVal.dataType,
      fromDate: range?.from ? new Date(range.from).toLocaleDateString('en-GB') : null,
      toDate: range?.to ? new Date(range.to).toLocaleDateString('en-GB') : null
    };

    this.dashboardService.getDataStatus({ params: formData }).subscribe({
      next: (res) => {
        this.columns = res.columns || [];
        const dates = Object.keys(res.data || {}).sort();

        this.tableData = dates.map(date => ({
          date,
          ...res.data[date]
        }));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  fetchStateWiseData(): void {
    this.submitState = true;
    if (this.stateWiseForm.invalid) return;

    this.loading = true;

    const formVal = this.stateWiseForm.value;
    const range = formVal.dateRange;

    const formData = {
      dataType: formVal.dataType,
      fromDate: range?.from ? new Date(range.from).toLocaleDateString('en-GB') : null,
      toDate: range?.to ? new Date(range.to).toLocaleDateString('en-GB') : null
    };

    this.dashboardService.getStateWiseStatus(formData).subscribe({
      next: (res) => {
        this.stateWiseColumns = res.columns.filter((c: any) => c !== 'STATE');

        this.stateWiseData = Object.keys(res.data).map(stateId => ({
          state: this.states.find(s => s.id === +stateId)?.name || stateId,
          ...res.data[stateId]
        }));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

}
