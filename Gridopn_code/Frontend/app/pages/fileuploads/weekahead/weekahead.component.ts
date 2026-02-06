import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/core/services/toast-service'; // Adjusted path if needed based on your structure
import { DatePipe } from '@angular/common';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import * as jspreadsheet from 'jspreadsheet-ce';
import * as XLSX from 'xlsx';
import { WeekAheadForecastService } from 'src/app/core/services/week-ahead-forecast.service';

@Component({
  selector: 'app-weekahead',
  templateUrl: './weekahead.component.html',
  styleUrls: ['./weekahead.component.scss']
})
export class WeekaheadComponent {

  excelData: { header: any[]; rows: any[] } | null = null;
  breadCrumbItems!: Array<{}>;
  spreadsheetData: any = [[]];
  loadedData: boolean = false;
  tooltipvalidationform!: UntypedFormGroup;
  formsubmit!: boolean;

  // Loader variables
  uploading: boolean = false;
  loadingText: string = 'Uploading...';

  validationform!: UntypedFormGroup;
  submitted = false;
  submit!: boolean;
  previewClicked: boolean = false;
  userData: any;

  // Initialize empty data array
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
    private weekAheadForecastService: WeekAheadForecastService
  ) { }

  ngOnInit(): void {

    this.breadCrumbItems = [
      { label: 'File Uploads' },
      { label: 'Week Ahead Forecast', active: true }
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

    // Initialize the spreadsheet with empty format
    this.weekAheadForecastService.fetchFormat().subscribe((res: any) => {
      if (res["status"] == "success") {
        this.data = res["data"];
        if (this.spreadsheet && this.spreadsheet.nativeElement && this.spreadsheet.nativeElement.jexcel) {
          // this.spreadsheet.nativeElement.jexcel.setData(this.data);
        }
      } else {
        this.toastService.show('Problem fetching format. Contact IT.', { classname: 'bg-danger text-white', delay: 5000 });
      }
    });

    this.toastService.show('Please upload the file to preview the data and then insert!', { classname: 'bg-info text-white', delay: 5000 });
  }

  fetchAndSetDate() {
    this.weekAheadForecastService.fetchWeekAheadDate({}).subscribe({
      next: (res) => {
        if (res?.week_ahead) {
          const fromDate = new Date(Date.parse(res.week_ahead.from));
          const toDate = new Date(Date.parse(res.week_ahead.to));
          this.validationform.patchValue({
            disabledDate: { from: fromDate, to: toDate }
          });
        }
      },
      error: (err) => {
        console.error('Error fetching week ahead date:', err);
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

  ngAfterViewInit() {
    jspreadsheet(this.spreadsheet.nativeElement, {
      data: this.data,
      tableOverflow: true,
      tableWidth: '1200px',
      tableHeight: '400px',
      columns: [
        { type: 'calendar', title: 'Date', width: '120' },
        { type: 'numeric', title: 'Block', width: '50', readOnly: true },
        { type: 'text', title: 'Period', width: '150', readOnly: true },
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
              { title: 'Date', colspan: 1 },
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
              { title: '', colspan: 1 },
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
              { title: '', colspan: 1 },
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
              { title: '', colspan: 1 }
           ]
      ],
      updateTable: (instance, cell, colIndex, rowIndex, value, displayedValue, cellName) => {
        if (colIndex == 3) { // Forecasted Demand
          const exactValue = value.toString();
          if (typeof value !== 'number' && Number.isNaN(Number.parseInt(exactValue))) {
            cell.style.background = '#ffcccb';
            this.toastService.show('Invalid Data detected', { classname: 'bg-warning text-white', delay: 5000 });
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

    this.validationform.get('excelFile')!.setValue(file);
    this.loadingText = 'Validating...';
    this.uploading = true;

    const formData = new FormData();
    formData.append('excelFile', file);

    // 1. Call Backend for Validation
    this.weekAheadForecastService.parseWeekAheadExcel(formData).subscribe({
      next: (res: any) => {
        this.uploading = false;
        
        if (res.error) {
          this.toastService.show(res.error, { classname: 'bg-danger text-white', delay: 5000 });
          this.validationform.get('excelFile')!.setValue(null);
          if (this.fileInput) this.fileInput.nativeElement.value = '';
          return;
        }

        // --- NEW: DATE CORRECTION LOGIC ---
        let processedData = res.data;
        const selectedRange = this.validationform.get('disabledDate')!.value;

        // Only correct dates if we have a selected range
        if (selectedRange && selectedRange.from) {
            let hasMismatch = false;
            const startDate = new Date(selectedRange.from);

            // Iterate through the rows (Expected 672 rows)
            for (let i = 0; i < processedData.length; i++) {
                // Determine Day Offset (0-6) based on block index. 96 blocks per day.
                const dayOffset = Math.floor(i / 96);
                
                // Calculate correct date for this row
                const expectedDateObj = new Date(startDate);
                expectedDateObj.setDate(startDate.getDate() + dayOffset);
                
                // Format to DD/MM/YYYY (Assuming backend/excel uses this format)
                const day = ('0' + expectedDateObj.getDate()).slice(-2);
                const month = ('0' + (expectedDateObj.getMonth() + 1)).slice(-2);
                const year = expectedDateObj.getFullYear();
                const expectedDateStr = `${day}/${month}/${year}`;

                // Compare with file date (Column 0)
                if (processedData[i][0] !== expectedDateStr) {
                    hasMismatch = true;
                    processedData[i][0] = expectedDateStr; // Overwrite
                }
            }

            if (hasMismatch) {
                this.toastService.show('Dates in file do not match selected week. Auto-corrected to selected range.', { classname: 'bg-warning text-white', delay: 5000 });
            }
        }
        // ----------------------------------

        this.tempData = processedData;
        this.toastService.show(res.message, { classname: 'bg-success text-white', delay: 5000 });
        this.spreadsheet.nativeElement.jexcel.setData(this.tempData);
        this.loadedData = true;

        this.confirm(); 
      },
      error: (err) => {
        this.uploading = false;
        console.error(err);
        this.toastService.show('Error parsing file on server.', { classname: 'bg-danger text-white', delay: 5000 });
      }
    });
  }

  confirm() {
    if (!this.loadedData) {
      this.toastService.show('Please upload and parse a file first!', { classname: 'bg-warning text-white', delay: 5000 });
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

          // Handle Date Range
          const dates = this.validationform.get('disabledDate')!.value;
          
          let fromStr = dates.from;
          let toStr = dates.to;

          const formatDate = (d: any) => {
               if(d instanceof Date) {
                   const day = ('0' + d.getDate()).slice(-2);
                   const month = ('0' + (d.getMonth() + 1)).slice(-2);
                   const year = d.getFullYear();
                   return `${day}/${month}/${year}`;
               }
               return d; 
          }

          formData.append('fromDate', formatDate(fromStr));
          formData.append('toDate', formatDate(toStr));
          
          // Send JSON string (this now includes corrected dates if any)
          formData.append('data', JSON.stringify(this.spreadsheet.nativeElement.jexcel.getData()));

          this.loadingText = 'Uploading...';
          this.uploading = true;

          // 2. Call Backend for Saving
          this.weekAheadForecastService.uploadWeekAheadData(formData).subscribe({
            next: (res: any) => {
              this.uploading = false;
              if (res.status === 'failure' || res.error) {
                this.toastService.show(res.message || res.error, { classname: 'bg-danger text-white', delay: 5000 });
              } else {
                this.toastService.show(res.message, { classname: 'bg-success text-white', delay: 5000 });
                this.resetForm();
              }
            },
            error: (err: any) => {
               this.uploading = false;
               this.toastService.show('Server Error during upload.', { classname: 'bg-danger text-white', delay: 5000 });
            }
          });
        }
      });
    } else {
        this.toastService.show('Please fill all required fields (State, Dates).', { classname: 'bg-warning text-white', delay: 5000 });
    }
  }

  resetForm() {
    this.validationform.reset();
    
    // Restore default state logic
    if (this.userData?.role === 'f_user') {
      const st = this.userData.state_id;
      this.validationform.get('state')!.setValue(st);
    }
    
    // Restore Date
    this.fetchAndSetDate();
    
    // Clear Inputs
    this.validationform.get('excelFile')!.setValue(null);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    
    // Reset Grid to original blank data
    this.spreadsheet.nativeElement.jexcel.setData(this.data);

    this.loadedData = false;
    this.uploading = false;
    this.submitted = false;
    this.submit = false;
    this.loadingText = 'Uploading...';
  }

  downloadExcel() {
    const excelFilePath = 'assets/Week-Ahead Demand Forecast format (from States).xlsx';
    const a = document.createElement('a');
    a.href = excelFilePath;
    a.download = 'sample.xlsx';
    a.click();
  }

  hasRole(roles: string[]): boolean {
    if (!this.userData || !this.userData.role) return false;
    const role = this.userData.role.toLowerCase();
    return roles.some(r => r.toLowerCase() === role);
  }

  getTotalElements(arr: any[][]): number {
    let totalCount = 0;
    for (const row of arr) totalCount += row.length;
    return totalCount;
  }
}