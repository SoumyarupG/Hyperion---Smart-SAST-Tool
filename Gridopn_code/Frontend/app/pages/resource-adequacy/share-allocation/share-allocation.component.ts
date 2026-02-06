import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ResourceAdequacyService } from 'src/app/core/services/resource-adequacy.service';
import { ToastService } from 'src/app/core/services/toast-service';
import Swal from 'sweetalert2';
import * as jspreadsheet from 'jspreadsheet-ce';
import * as XLSX from 'xlsx'; // <--- Changed from PapaParse
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';




@Component({
  selector: 'app-share-allocation',
  templateUrl: './share-allocation.component.html',
  styleUrls: ['./share-allocation.component.scss']
})
export class ShareAllocationComponent implements AfterViewInit {

  @ViewChild('viewSpreadsheet', { static: true })
  viewSpreadsheet!: ElementRef;

  @ViewChild('uploadSpreadsheet') uploadSpreadsheet!: ElementRef;

  uploadSheetInstance: any;
  showPreview = false;

  isgsShareData: any = {};
  isgsTableData: any[] = [];
  isgsStates: string[] = [];


  selectedTab: 'view' | 'upload' = 'view';
  loading = false;
  uploading = false;
  submitted = false;

  applicableFrom = '';
  uploadedAt = '';


  viewSheetInstance: any;

  validationForm!: UntypedFormGroup;

  breadCrumbItems = [
    { label: 'Resource Adequacy' },
    { label: 'Share Allocation', active: true }
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private service: ResourceAdequacyService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
     private modalService: NgbModal   
  ) {}

  ngOnInit(): void {
    this.validationForm = this.fb.group({
      allocationDate: [null, Validators.required],
      excelFile: [null, Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.loadCurrentShareAllocation();
  }

  loadCurrentShareAllocation(): void {
    this.loading = true;

    this.service.getCurrentShareAllocation().subscribe({
      next: (res: any) => {

        this.applicableFrom = res.applicable_from || '';
        this.uploadedAt = res.uploaded_at || '';

         this.isgsShareData = res.isgs_share || {};
          this.prepareIsgsTable();

        if (this.viewSheetInstance) {
          this.viewSheetInstance.destroy();
          this.viewSheetInstance = null;
        }

        // ✅ Step 1: Allow Angular to paint DOM
        setTimeout(() => {

          const container = this.viewSpreadsheet?.nativeElement;
          if (!container) {
            console.error('Spreadsheet container not found');
            return;
          }

          // ✅ Step 2: Force browser layout
          container.offsetHeight;

          // ✅ Step 3: Render spreadsheet
          this.viewSheetInstance = jspreadsheet(container, {
            data: res.rows,
            colHeaders: res.headers,
            nestedHeaders: res.nestedHeaders,
            columns: res.columns,
            freezeColumns: 3,
            tableOverflow: true,
            tableHeight: '450px',
            editable: true,
            allowInsertRow: false,
            allowInsertColumn: false,
            allowDeleteRow: false,
            allowDeleteColumn: false,
            columnSorting: false,
            search: false
          });

          // ✅ Step 4: Hide loader AFTER render
          requestAnimationFrame(() => {
            this.loading = false;
          });

        }, 0);
      },
      error: () => {
        this.loading = false;
        this.toast.show(
          'Failed to load share allocation',
          { classname: 'bg-danger text-white', delay: 3000 }
        );
      }
    });
  }



    setTab(tab: 'view' | 'upload'): void {

      this.selectedTab = tab;

      if (tab === 'view') {

        // RESET UPLOAD FORM
        this.submitted = false;
        this.validationForm.reset({
          allocationDate: null,
          excelFile: null
        });

        // CLEAR FILE INPUT
        const fileInput =
          document.querySelector<HTMLInputElement>('input[type="file"]');
        if (fileInput) fileInput.value = '';

        // DESTROY PREVIEW
        if (this.uploadSheetInstance) {
          this.uploadSheetInstance.destroy();
          this.uploadSheetInstance = null;
        }
        this.showPreview = false;

        // RELOAD VIEW DATA
        this.loadCurrentShareAllocation();
      }
    }



// =========================================================
  // ✅ MODIFIED CONFIRM UPLOAD METHOD
  // =========================================================
  confirmUpload(): void {
    this.submitted = true;

    // 1. Check Form Validity
    if (this.validationForm.invalid) {
      this.toast.show(
        'Please fix validation errors',
        { classname: 'bg-danger text-white', delay: 3000 }
      );
      return;
    }

    // 2. SweetAlert Confirmation
    Swal.fire({
      title: 'Are you sure?',
      text: "You are about to upload this share allocation. This action cannot be reverted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgb(3, 142, 220)',
      cancelButtonColor: 'rgb(243, 78, 78)',
      confirmButtonText: 'Yes, Upload it!'
    }).then(result => {
      
      if (result.isConfirmed) {
        
        // 3. Prepare Form Data
        const formData = new FormData();
        
        // A. Format Date (YYYY-MM-DD)
        const dateVal = this.validationForm.get('allocationDate')?.value;
        let formattedDate: string;

        if (dateVal instanceof Date) {
          const y = dateVal.getFullYear();
          const m = String(dateVal.getMonth() + 1).padStart(2, '0');
          const d = String(dateVal.getDate()).padStart(2, '0');
          formattedDate = `${y}-${m}-${d}`;
        } else {
          formattedDate = dateVal;
        }

        
        formData.append('allocation_date', formattedDate);
        
        // B. Attach Original File
      const gridData = this.uploadSheetInstance.getData();
      formData.append('dataFile', new Blob(
        [JSON.stringify(gridData)],
        { type: 'application/json' }
      ));

        // C. Attach Grid Data (Captures any edits made in the preview)
        // if (this.uploadSheetInstance) {
        //    // jspreadsheet-ce uses getData() to return the array of arrays
        //    const gridData = this.uploadSheetInstance.getData();
        //    formData.append('data', JSON.stringify(gridData));
        // }

        this.uploading = true;

        // 4. API Call
        this.service.uploadShareAllocation(formData).subscribe({
          next: (res: any) => {
            this.uploading = false;

            // Handle potential backend error wrapped in 200 OK (common pattern)
            if (res && 'error' in res && res.error) {
               Swal.fire({
                title: 'Error!',
                text: res.error,
                icon: 'error',
                confirmButtonColor: 'rgb(243, 78, 78)'
              });
              return;
            }

            // 5. Success Handling
            const successMessage = res?.message || 'Share allocation uploaded successfully!';
            
            Swal.fire({
              title: 'Uploaded!',
              text: successMessage,
              icon: 'success',
              confirmButtonColor: 'rgb(3, 142, 220)',
              confirmButtonText: 'OK'
            }).then(() => {
              // Reset Form & UI
              this.resetUploadState();
              
              // Switch to View Tab & Reload
              this.setTab('view');
            });
          },
          error: (err: any) => {
            this.uploading = false;
            Swal.fire({
              title: 'Upload Failed',
              text: 'Something went wrong while uploading.',
              icon: 'error',
              confirmButtonColor: 'rgb(243, 78, 78)'
            });
          }
        });
      }
    });
  }

  // Helper to clean up after upload
  private resetUploadState(): void {
    this.submitted = false;
    
    // Reset Form
    this.validationForm.reset({
      allocationDate: null,
      excelFile: null
    });

    // Clear File Input Manually (since it's not bound via ngModel)
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) fileInput.value = '';

    // Destroy Upload Preview
    if (this.uploadSheetInstance) {
      this.uploadSheetInstance.destroy();
      this.uploadSheetInstance = null;
    }
    this.showPreview = false;
  }



// =========================================================
  // 1. FILE SELECTION (Replaces PapaParse Logic)
  // =========================================================
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Update form control
    this.validationForm.patchValue({ excelFile: file });
    this.validationForm.get('excelFile')?.updateValueAndValidity();

    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      // 1. Read Workbook
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // 2. Convert to JSON (Array of Arrays)
      const rawData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: '',
        blankrows: false
      }) as any[][];

      // 3. Detect Structure
      const structure = this.detectSheetStructure(rawData);
      if (!structure) {
        // Clear input if invalid
        input.value = ''; 
        return; 
      }

      // 4. Extract Parts
      const blockRow = rawData[structure.blockRowIndex]; // The 1-96 row
      const headers = rawData[structure.headerRowIndex]; // Type, Seller, Buyer...
      const dataRows = rawData.slice(structure.dataStartRowIndex); // The actual data

      // 5. Validate Content
      if (!this.validateDataRows(dataRows)) {
        input.value = '';
        return;
      }

      // 6. Render
      this.renderUploadPreview(blockRow, headers, dataRows);
      
      this.toast.show(
        'Format validated successfully',
        { classname: 'bg-success text-white', delay: 3000 }
      );
    };

    reader.readAsBinaryString(file);
  }



downloadFormat(): void {
  this.service.downloadShareAllocationFormat().subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SR_Share_Allocation_Format.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => {
      this.toast.show(
        'Failed to download format',
        { classname: 'bg-danger text-white', delay: 3000 }
      );
    }
  });
}


  get form() {
    return this.validationForm.controls;
  }


// =========================================================
  // 2. RENDER PREVIEW (Merged Logic)
  // =========================================================
  renderUploadPreview(blockRow: any[], headers: any[], rows: any[][]): void {
    // 1. Reset existing instance
    if (this.uploadSheetInstance) {
      this.uploadSheetInstance.destroy();
    }

    // 2. Enable the preview flag
    this.showPreview = true;

    // CRITICAL: Force Angular to render the HTML element immediately
    this.cdr.detectChanges(); 

    // 3. Prepare Nested Headers
    // Row 1: The Block Numbers (from the file)
    const nestedBlockRow = blockRow.map((b: any, i: number) => ({
      title: i < 3 ? '' : String(b),
      colspan: 1
    }));

    // Row 2: The Actual Column Names
    const nestedHeaderRow = headers.map((h: any) => ({
      title: h,
      colspan: 1
    }));

    // Combine for JSpreadsheet
    const nestedHeaders = [
      nestedBlockRow,
      nestedHeaderRow
    ];

    // 4. Prepare Columns Config
    const columns = headers.map((h: any, index: number) => {
      if (index < 3) {
        return { width: 160, readOnly: true };
      }
      return {
        width: 90,
        readOnly: false,
        type: 'numeric' as const,
        mask: '0.0000'
      };
    });

    // 5. THE FIX: Create an array of empty strings
    // This satisfies JSpreadsheet (it gets an array) AND visualy hides "A, B, C"
    const emptyColHeaders = headers.map(() => '');

    // 6. Render
    setTimeout(() => {
      if (!this.uploadSpreadsheet || !this.uploadSpreadsheet.nativeElement) {
        console.error('Upload spreadsheet element not found!');
        return;
      }

      this.uploadSheetInstance = jspreadsheet(
        this.uploadSpreadsheet.nativeElement,
        {
          data: rows,
          
          // ✅ FIX: Use array of empty strings
          colHeaders: emptyColHeaders, 
          
          nestedHeaders: nestedHeaders,
          columns: columns,

          freezeColumns: 3,
          tableOverflow: true,
          tableHeight: '500px',
          editable: true,
          allowInsertRow: false,
          allowInsertColumn: false,
          allowDeleteRow: false,
          allowDeleteColumn: false,
          columnSorting: false,
          search: false
        }
      );
    }, 0);
  }



  // =========================================================
  // 3. HELPERS (From Working Code)
  // =========================================================
  detectSheetStructure(data: any[]) {
    const VALID_TYPES = ['Allocated %', 'Unallocated %', 'Fp %', 'Reserved MW', 'Offbar %'];

    let blockRowIndex = -1;
    let headerRowIndex = -1;
    let dataStartRowIndex = -1;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 10) continue;

      // Detect Block Row (1...96)
      const blocks = row.slice(3);
      if (blocks.length >= 96 && blocks.slice(0, 96).every((v: any, idx: number) => Number(v) === idx + 1)) {
        blockRowIndex = i;
        continue;
      }

      // Detect Header Row
      if (row[0] === 'Type' && row[1] === 'Seller Acronym' && row[2] === 'Buyer Acronym') {
        headerRowIndex = i;
        continue;
      }

      // Detect Data Start
      if (VALID_TYPES.includes(String(row[0]).trim())) {
        dataStartRowIndex = i;
        break;
      }
    }

    if (blockRowIndex === -1 || headerRowIndex === -1 || dataStartRowIndex === -1) {
      this.toast.show(
        'Unable to auto-detect file structure. Please check the format.',
        { classname: 'bg-danger text-white', delay: 5000 }
      );
      return null;
    }

    return { blockRowIndex, headerRowIndex, dataStartRowIndex };
  }

  validateDataRows(rows: any[]): boolean {
    const REQUIRED_TYPES = ['Allocated %', 'Unallocated %', 'Fp %', 'Reserved MW', 'Offbar %'];
    const comboMap = new Map<string, Set<string>>();

    for (const r of rows) {
      // Create a unique key for Seller + Buyer
      const key = `${r[1]}||${r[2]}`;
      if (!comboMap.has(key)) comboMap.set(key, new Set());
      comboMap.get(key)!.add(String(r[0]).trim());
    }

    // Check if every combo has all 5 required types
    for (const [k, set] of comboMap.entries()) {
      const missing = REQUIRED_TYPES.filter(t => !set.has(t));
      if (missing.length) {
        const [seller, buyer] = k.split('||');
        this.toast.show(
          `Missing rows for ${seller} -> ${buyer}: ${missing.join(', ')}`,
          { classname: 'bg-danger text-white', delay: 5000 }
        );
        return false;
      }
    }
    return true;
  }


  downloadCurrentShareAllocation(): void {

  if (!this.applicableFrom) {
    this.toast.show(
      'No allocation date available to download',
      { classname: 'bg-warning text-dark', delay: 3000 }
    );
    return;
  }

  this.service.downloadCurrentShareAllocation(this.applicableFrom)
    .subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SR_Share_Allocation_${this.applicableFrom}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toast.show(
          'Failed to download share allocation',
          { classname: 'bg-danger text-white', delay: 3000 }
        );
      }
    });
}



  prepareIsgsTable(): void {

    this.isgsTableData = [];
    this.isgsStates = [];

    if (!this.isgsShareData || Object.keys(this.isgsShareData).length === 0) {
      return;
    }

    // Extract states dynamically from first station
    const firstStation = Object.keys(this.isgsShareData)[0];
    this.isgsStates = Object.keys(this.isgsShareData[firstStation]);

    // Build rows
    for (const station of Object.keys(this.isgsShareData)) {
      this.isgsTableData.push({
        station,
        ...this.isgsShareData[station]
      });
    }
  }


    openIsgsModal(content: any): void {

      if (!this.isgsTableData.length) {
        this.toast.show(
          'ISGS Share data not available',
          { classname: 'bg-warning text-dark', delay: 3000 }
        );
        return;
      }

      this.modalService.open(content, {
        size: 'xl',
        backdrop: 'static',
        centered: true,
        scrollable: true
      });
    }




}
