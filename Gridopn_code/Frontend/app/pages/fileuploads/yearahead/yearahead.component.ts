import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/core/services/toast-service';
import { DatePipe } from '@angular/common';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import * as jspreadsheet from 'jspreadsheet-ce';
import * as XLSX from 'xlsx';
import { YearAheadForecastService } from 'src/app/core/services/year-ahead-forecast.service';

@Component({
  selector: 'app-yearahead',
  templateUrl: './yearahead.component.html',
  styleUrls: ['./yearahead.component.scss']
})
export class YearaheadComponent {

  excelData: { header: any[]; rows: any[] } | null = null;
  breadCrumbItems!: Array<{}>;
  spreadsheetData: any = [[]];
  loadedData: boolean = false;
  tooltipvalidationform!: UntypedFormGroup;
  formsubmit!: boolean;

  uploading: boolean = false;
  loadingText: string = 'Uploading...';

  validationform!: UntypedFormGroup;
  submitted = false;
  submit!: boolean;
  previewClicked: boolean = false;
  userData: any;

  data: any = [];

  state_id_dict: any = { 'kar_state': 1, 'tn_state': 2, 'tg_state': 3, 'ap_state': 4, 'ker_state': 5 }

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('editmodalShow') editmodalShow!: TemplateRef<any>;
  @ViewChild('modalShow') modalShow !: TemplateRef<any>;
  @ViewChild("spreadsheet", { static: true }) spreadsheet !: ElementRef<any>;

  constructor(
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    public toastService: ToastService,
    private TokenStorageService: TokenStorageService,
    private datePipe: DatePipe,
    private yearAheadForecastService: YearAheadForecastService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'File Uploads' },
      { label: 'Year Ahead Forecast', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    this.validationform = this.formBuilder.group({
      state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      disabledDate: [null, [Validators.required]],
      excelFile: [null, [Validators.required]]
    });

    this.fetchAndSetDate();

    if (this.userData?.role === 'f_user') {
      const st = this.userData.state_id;
      this.validationform.get('state')!.setValue(st);
      this.validationform.get('state')!.disable();
      this.validationform.get('disabledDate')!.disable();
    }

    if (!this.hasRole(['admin'])) {
      this.validationform.get('state')?.disable();
    }

    // Initialize Empty Grid
    this.yearAheadForecastService.fetchFormat().subscribe((res: any) => {
      if (res["status"] == "success") {
        this.data = res["data"];
        if (this.spreadsheet && this.spreadsheet.nativeElement && this.spreadsheet.nativeElement.jexcel) {
           this.spreadsheet.nativeElement.jexcel.setData(this.data);
        }
      }
    });

    this.toastService.show('Please upload the file to preview the data and then insert!', { classname: 'bg-info text-white', delay: 5000 });
  }

  fetchAndSetDate() {
    this.yearAheadForecastService.fetchYearAheadDate({}).subscribe({
      next: (res) => {
        if (res?.year_ahead) {
          const fromDate = new Date(Date.parse(res.year_ahead.from));
          const toDate = new Date(Date.parse(res.year_ahead.to));
          this.validationform.patchValue({
            disabledDate: { from: fromDate, to: toDate }
          });
        }
      },
      error: (err) => {
        console.error('Error fetching Year ahead date:', err);
      }
    });
  }

  tempData: any = [];

  validSubmit() {
    this.submit = true;
  }

  get form() {
    return this.validationform.controls;
  }

  // --- Helper to Clear File Input on Error ---
  clearFileInput() {
    this.validationform.get('excelFile')!.setValue(null);
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  ngAfterViewInit() {
    jspreadsheet(this.spreadsheet.nativeElement, {
      data: this.data,
      tableOverflow: true,
      tableWidth: '1200px',
      tableHeight: '400px',
      columns: [
        { type: 'calendar', title: 'Date', width: '120' },
        { type: 'numeric', title: 'Hour', width: '50', readOnly: true },
        { type: 'numeric', title: 'MW', width: '150', decimal: '.', mask: '0.00' }, // Demand
        { type: 'numeric', title: 'MW', width: '100', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '100', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '100', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '100', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '100', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '180', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '100', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '225', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '225', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '225', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '100', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '300', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '175', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '175', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '300', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '300', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MW', width: '300', decimal: '.', mask: '0.00' },
        { type: 'numeric', title: 'MVar', width: '300', decimal: '.', mask: '0.00' }
      ],
      nestedHeaders: [
          [
              { title: 'Time', colspan: 2 },
              { title: 'Forecasted Generation/ Availability', colspan: 12 },
              { title: 'Gap between Demand & Availability...', colspan: 1 },
              { title: 'Proposed Procurement', colspan: 2 },
              { title: 'Shortages after day ahead...', colspan: 1 },
              { title: 'Relief through planned restrictions...', colspan: 1 },
              { title: 'Additional Load shedding...', colspan: 1 },
              { title: 'Reactive Power Forecast', colspan: 1 }
          ],
          [
              { title: '', colspan: 2 },
              { title: 'Forecasted Demand (A)', colspan: 1 },
              { title: 'From its own sources (Excluding Renewable)', colspan: 4 },
              { title: 'From Renewable Sources', colspan: 4 },
              { title: 'From ISGS & Other LTA & MTOA', colspan: 1 },
              { title: 'From Bilateral Transaction...', colspan: 1 },
              { title: 'Total Availability', colspan: 1 },
              { title: '', colspan: 1 },
              { title: 'Under Bilateral Transaction...', colspan: 1 },
              { title: 'Through Power Exchange (I)', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 }
          ],
           [
              { title: '', colspan: 2 },
              { title: '', colspan: 1 },
              { title: 'Thermal (Coal + Lignite)', colspan: 1 },
              { title: 'Gas', colspan: 1 },
              { title: 'Hydro', colspan: 1 },
              { title: 'Total (B)', colspan: 1 },
              { title: 'Solar', colspan: 1 },
              { title: 'Wind', colspan: 1 },
              { title: 'Other RES', colspan: 1 },
              { title: 'Total (C)', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 },
              { title: '', colspan: 1 }
           ]
      ],
      updateTable: (instance, cell, colIndex, rowIndex, value, displayedValue, cellName) => {
        if (colIndex == 2) {
          const exactValue = value.toString();
          if (typeof value !== 'number' && Number.isNaN(Number.parseInt(exactValue))) {
            cell.style.background = '#ffcccb';
            this.toastService.show('Invalid Data detected', { classname: 'bg-warning text-white', delay: 3000 });
          } else if (typeof value === "number" || !Number.isNaN(Number.parseFloat(exactValue))) {
            cell.style.background = 'white';
          }
        }
      },
    });
  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Ensure Dates are selected first
    const dates = this.validationform.get('disabledDate')!.value;
    if (!dates || !dates.from || !dates.to) {
        this.toastService.show('Please select a valid Year range first.', { classname: 'bg-warning text-white', delay: 5000 });
        this.clearFileInput();
        return;
    }

    this.validationform.get('excelFile')!.setValue(file);
    this.loadingText = 'Validating...';
    this.uploading = true;

    // 2. Prepare Form Data
    const formData = new FormData();
    formData.append('excelFile', file);

    const formatDate = (d: any) => {
        if(d instanceof Date) {
            const day = ('0' + d.getDate()).slice(-2);
            const month = ('0' + (d.getMonth() + 1)).slice(-2);
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return d; 
    }
    formData.append('fromDate', formatDate(dates.from));
    formData.append('toDate', formatDate(dates.to));

    // 3. Send to Backend for Parsing & Validation
    this.yearAheadForecastService.parseYearAheadExcel(formData).subscribe({
      next: (res: any) => {
        this.uploading = false;
        
        if (res.error) {
          // Backend Error (e.g., Row Count Mismatch)
          this.toastService.show(res.error, { classname: 'bg-danger text-white', delay: 8000 });
          this.clearFileInput(); // Fix: Clear input on error so user sees it failed
          return;
        }

        // Success
        this.tempData = res.data;
        
        // --- Notify if Dates were Replaced ---
        if (res.message && (res.message.includes('Dates aligned') || res.message.includes('Warning'))) {
             this.toastService.show(res.message, { classname: 'bg-warning text-white', delay: 8000 });
        } else {
             this.toastService.show(res.message, { classname: 'bg-success text-white', delay: 3000 });
        }
        // -------------------------------------

        this.spreadsheet.nativeElement.jexcel.setData(this.tempData);
        this.loadedData = true;

        this.confirm(); 
      },
      error: (err) => {
        this.uploading = false;
        console.error(err);
        this.toastService.show('Error parsing file on server.', { classname: 'bg-danger text-white', delay: 3000 });
        this.clearFileInput(); // Fix: Clear input on network error
      }
    });
  }

  confirm() {
    if (!this.loadedData) {
      this.toastService.show('Please upload and parse a file first!', { classname: 'bg-warning text-white', delay: 3000 });
      return;
    }
    this.submit = true;

    if (this.validationform.valid) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This will save the data to the server record.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
        confirmButtonText: 'Yes, Upload it!'
      }).then(result => {
        if (result.value) {
          const formData = new FormData();
          formData.append('state', this.validationform.get('state')!.value);

          const dates = this.validationform.get('disabledDate')!.value;
          const formatDate = (d: any) => {
               if(d instanceof Date) {
                   const day = ('0' + d.getDate()).slice(-2);
                   const month = ('0' + (d.getMonth() + 1)).slice(-2);
                   const year = d.getFullYear();
                   return `${day}/${month}/${year}`;
               }
               return d; 
          }

          formData.append('fromDate', formatDate(dates.from));
          formData.append('toDate', formatDate(dates.to));
          
          const jsonString = JSON.stringify(this.spreadsheet.nativeElement.jexcel.getData());
          const jsonBlob = new Blob([jsonString], { type: 'application/json' });
          formData.append("dataFile", jsonBlob, "year_data.json");

          this.loadingText = 'Uploading...';
          this.uploading = true;

          this.yearAheadForecastService.uploadYearAheadFile(formData).subscribe((res: any) => {
            this.uploading = false;
            if (res.status === 'failure' || res.error) {
              this.toastService.show(res.message || res.error, { classname: 'bg-danger text-white', delay: 5000 });
            } else {
              this.toastService.show(res.message, { classname: 'bg-success text-white', delay: 3000 });
              this.resetForm();
            }
          }, (err: any) => {
             this.uploading = false;
             this.toastService.show('Server Error during upload.', { classname: 'bg-danger text-white', delay: 3000 });
          });
        }
      });
    } else {
        this.toastService.show('Please fill all required fields.', { classname: 'bg-warning text-white', delay: 3000 });
    }
  }

  resetForm() {
    this.validationform.reset();
    if (this.userData?.role === 'f_user') {
      const st = this.userData.state_id;
      this.validationform.get('state')!.setValue(st);
    }
    this.fetchAndSetDate();
    this.clearFileInput();
    
    this.yearAheadForecastService.fetchFormat().subscribe((res: any) => {
      if(res["status"] == "success") {
        this.data = res["data"];
        this.spreadsheet.nativeElement.jexcel.setData(this.data);
      }
    });

    this.loadedData = false;
    this.uploading = false;
    this.submitted = false;
    this.submit = false;
    this.loadingText = 'Uploading...';
  }

  downloadExcel() {
    const excelFilePath = 'assets/Year-Ahead Demand Forecast format (from States).xlsx';
    const a = document.createElement('a');
    a.href = excelFilePath;
    a.download = 'YearAheadFormat.xlsx';
    a.click();
  }

  hasRole(roles: string[]): boolean {
    if (!this.userData || !this.userData.role) return false;
    const role = this.userData.role.toLowerCase();
    return roles.some(r => r.toLowerCase() === role);
  }
}