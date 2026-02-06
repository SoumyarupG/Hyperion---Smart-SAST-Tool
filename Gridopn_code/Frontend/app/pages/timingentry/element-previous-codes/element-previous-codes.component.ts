import { Component, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PendingEntriesService } from 'src/app/core/services/pending-entries.service';
import { ListJsModel } from './listjs.model';
import { NgbdListSortableHeader } from './listjs-sortable.directive';
// import { OrdersService } from '../timingentry-pending/listjs.service';
import { FuzzyList, dataattribute, existingList, paginationlist } from './data';
import { OrdersService1 } from './listjs.service';
import { listSortEvent } from './listjs-sortable.directive';
import { DecimalPipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-element-previous-codes',
  templateUrl: './element-previous-codes.component.html',
  styleUrls: ['./element-previous-codes.component.scss'],
  providers: [OrdersService1, DecimalPipe]
})


export class ElementPreviousCodesComponent {

  breadCrumbItems!: Array<{}>;
  dayForm!: UntypedFormGroup; // Define the form group
  loading: boolean = false;



  submitted = false;

  rows = [
    { name: 'John', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 35 },
    // Add more data objects
  ];



  listJsForm!: UntypedFormGroup;
  pendingEntryForm!: UntypedFormGroup;
  ListJsData!: ListJsModel[];
  checkedList: any;
  masterSelected!: boolean;
  ListJsDatas: any;

  page: any = 1;
  pageSize: any = 3;
  startIndex: number = 0;
  endIndex: number = 3;
  totalRecords: number = 0;

  paginationDatas: any;
  attributedata: any;
  existingData: any;
  fuzzyData: any;

  existingTerm: any;
  fuzzyTerm: any;
  dataterm: any;
  term: any;


  modalTableData: any = [];

  // Table data
  ListJsList!: Observable<ListJsModel[]>;
  total!: Observable<number>;

  @ViewChildren(NgbdListSortableHeader) headers!: QueryList<NgbdListSortableHeader>;



  constructor(public previousCodesService: PendingEntriesService, private formBuilder: UntypedFormBuilder, public service: OrdersService1) {

  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */

    this.ListJsList = this.service.countries$;
    this.total = this.service.total$;

    
    this.dayForm = this.formBuilder.group({
      dayRange: [{"from": '', "to":'' }] // Initialize the control for the date range picker
    });



    this.listJsForm = this.formBuilder.group({
      ids: [''],
      customer_issue_time: ['', [Validators.required]],
      element_type: ['', [Validators.required]],
      element_name: ['', [Validators.required]],
      switching: ['', [Validators.required]],
      nldc_code: ['', [Validators.required]],
      srldc_code: ['', [Validators.required]],
      category: ['', [Validators.required]],
      code_issued_to: ['', [Validators.required]],
      code_requested_by: ['', [Validators.required]]
    });


    /**
    * fetches data
    */

    // this.total = 0;
   
    


    

    this.ListJsList.subscribe(x => {

      this.ListJsDatas = Object.assign([], x);
      // console.log(this.ListJsDatas)
    });

    

    this.attributedata = dataattribute
    this.existingData = existingList
    this.fuzzyData = FuzzyList

    this.paginationDatas = paginationlist
    this.totalRecords = this.paginationDatas.length

    this.startIndex = (this.page - 1) * this.pageSize + 1;
    this.endIndex = (this.page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    this.paginationDatas = paginationlist.slice(this.startIndex - 1, this.endIndex);


    this.breadCrumbItems = [
      { label: 'Timing Entry' },
      { label: 'Element Previous Codes', active: true }
    ];

  }




    // The master checkbox will check/ uncheck all items
    checkUncheckAll(ev: any) {
      this.ListJsDatas.forEach((x: { state: any; }) => x.state = ev.target.checked)
    }

  onSort({ column, direction }: listSortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.listsortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  get form() {
    return this.listJsForm.controls;
  }

  loadPage() {
    this.startIndex = (this.page - 1) * this.pageSize + 1;
    this.endIndex = (this.page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    this.paginationDatas = paginationlist.slice(this.startIndex - 1, this.endIndex);
  }


  onSubmit() {
    this.loading = true;
  
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, pad with 0
      const day = String(date.getDate()).padStart(2, '0'); // Pad day with 0 if necessary
      const hours = String(date.getHours()).padStart(2, '0'); // Pad hours with 0 if necessary
      const minutes = String(date.getMinutes()).padStart(2, '0'); // Pad minutes with 0 if necessary
  
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
  
    const formData = {
      from_date: formatDateTime(this.dayForm.get('dayRange')?.value["from"]),
      to_date: formatDateTime(this.dayForm.get('dayRange')?.value["to"])
    };
  
    // Fetch data based on form submission
    this.service.getPreviousCodes(formData).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.status === 'success') {
          // console.log('Data fetched successfully:', res.data);
        } else {
          console.error('Error fetching data:', res['error']);
        }
      },
      (error: any) => {
        this.loading = false;
        console.error('Error fetching previous codes:', error);
      }
    );
  }


  exportTableToExcel(): void {
    // Clone the data and remove `isSelected` and `id` from each entry
    const filteredData = this.ListJsDatas.map((item: any) => {
      const clonedItem = { ...item }; // Create a shallow copy
      delete clonedItem.isSelected; // Remove `isSelected` property
      delete clonedItem.id;         // Remove `id` property
      return clonedItem;
    });
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
  
    // Make the header row bold
    const headerKeys = Object.keys(filteredData[0]);
    headerKeys.forEach((key, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (ws[cellAddress]) {
        ws[cellAddress].s = { font: { bold: true } };
      }
    });
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Previous Codes');
  
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Previous_Codes');
  }
  
  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, fileName + EXCEL_EXTENSION);
  }
  
}




  



