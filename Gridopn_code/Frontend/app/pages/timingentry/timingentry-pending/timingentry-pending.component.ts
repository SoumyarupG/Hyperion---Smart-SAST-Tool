import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { ListJs } from './data';

// Sweet Alert
import Swal from 'sweetalert2';

import { ListJsModel, paginationModel } from './listjs.model';
import { paginationlist, dataattribute, existingList, FuzzyList } from './data';
import { OrdersService } from './listjs.service';
import { NgbdListSortableHeader, listSortEvent } from './listjs-sortable.directive';
import { ToastService } from './toast-service';
import { PendingEntriesService } from 'src/app/core/services/pending-entries.service';
import { Router } from '@angular/router';

declare var $: any;


@Component({
  selector: 'app-timingentry-pending',
  templateUrl: './timingentry-pending.component.html',
  styleUrls: ['./timingentry-pending.component.scss'],
  providers: [OrdersService, DecimalPipe]
})




export class TimingentryPendingComponent {
  isUpdating = false; // Flag to prevent recursive updates

  rows = [
    { name: 'John', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 35 },
    // Add more data objects
  ];

  breadCrumbItems!: Array<{}>;
  submitted = false;

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

  tempData: any[]

  // Table data
  ListJsList!: Observable<ListJsModel[]>;
  total!: Observable<number>;

  @ViewChildren(NgbdListSortableHeader) headers!: QueryList<NgbdListSortableHeader>;

  constructor(private modalService: NgbModal, public service: OrdersService, private formBuilder: UntypedFormBuilder, public toastService: ToastService, public pendingService: PendingEntriesService, private router: Router) {
    
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    
    
    // console.log(this.ListJsList)
    // console.log(this.total);



    this.ListJsList = this.service.countries$;
    this.total = this.service.total$;


    
    // console.log("Above is before assignment and below is after assignment!")

    // console.log(this.ListJsList)
    // console.log(this.total);

    

    

    

    



    this.breadCrumbItems = [
      { label: 'Timing Entry' },
      { label: 'Pending', active: true }
    ];

    /**
     * Form Validation
     */
    this.listJsForm = this.formBuilder.group({
      ids: [''],
      customer_name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      date: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    this.listJsForm = this.formBuilder.group({
      ids: [''],
      code_issue_time: ['', [Validators.required]],
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
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    // console.log(content);
    // console.log(content);
    var checkboxes: any = document.getElementsByName('checkAll');
    var result
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }

    if (checkedVal.length > 0) {
      // console.log(checkedVal);
      // console.log(this.ListJsDatas)

      this.modalTableData = this.ListJsDatas.filter((item: any) => item.state);

      this.tempData = this.modalTableData.map((item:any) => ({ enteredDate: item.codeIssueTime }));



      this.modalService.open(content, { size: 'xl', centered: false });
    }
    else {
      Swal.fire({ text: 'Please select at least one checkbox', confirmButtonColor: '#239eba', });
    }
    this.checkedValGet = checkedVal;

    // this.submitted = false;
    // this.modalService.open(content, { size: 'xl', centered: false });

  }

  /**
   * Form data get
   */
  get form() {
    return this.listJsForm.controls;
  }


    deleteRow(data: any) {
      const objectIdToDelete = 2; // The ID of the object you want to delete

      // Use the filter method to create a new array without the object to delete
      this.modalTableData = this.modalTableData.filter((obj: any) => obj.srldcCode !== data.srldcCode);

      for (const item of this.ListJsDatas) {
        if(item.srldcCode == data.srldcCode){
          item.state = false;
        }
      }


    }






  /**
* Pagination
*/
  loadPage() {
    this.startIndex = (this.page - 1) * this.pageSize + 1;
    this.endIndex = (this.page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    this.paginationDatas = paginationlist.slice(this.startIndex - 1, this.endIndex);
  }



  /**
  * Save saveListJs
  */
  // saveListJs() {
  //   if (this.listJsForm.valid) {
  //     if (this.listJsForm.get('ids')?.value) {
  //       this.ListJsDatas = this.ListJsDatas.map((data: { id: any; }) => data.id === this.listJsForm.get('ids')?.value ? { ...data, ...this.listJsForm.value } : data)
  //     } else {
  //       const customer_name = this.listJsForm.get('customer_name')?.value;
  //       const email = this.listJsForm.get('email')?.value;
  //       const phone = this.listJsForm.get('phone')?.value;
  //       const date = '14 Apr, 2021';
  //       const status_color = "success";
  //       const status = this.listJsForm.get('status')?.value;
  //       this.ListJsDatas.push({
  //         customer_name,
  //         email,
  //         phone,
  //         date,
  //         status_color,
  //         status
  //       });
  //       this.modalService.dismissAll()
  //     }
  //   }
  //   this.modalService.dismissAll();
  //   setTimeout(() => {
  //     this.listJsForm.reset();
  //   }, 2000);
  //   this.submitted = true
  // }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.ListJsDatas.forEach((x: { state: any; }) => x.state = ev.target.checked)
  }

  /**
  * Confirmation mail model
  */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {

    
    if (id) {
      document.getElementById('lj_' + id)?.remove();
    }
    else {
      this.checkedValGet.forEach((item: any) => {
        document.getElementById('lj_' + item)?.remove();
      });
    }
  }

  /**
  * Multiple Delete
  */
  checkedValGet: any[] = [];
  deleteMultiple(content: any) {
    var checkboxes: any = document.getElementsByName('checkAll');
    var result
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }

    if (checkedVal.length > 0) {
      this.modalService.open(content, { centered: true });
    }
    else {
      Swal.fire({ text: 'Please select at least one checkbox', confirmButtonColor: '#239eba', });
    }
    this.checkedValGet = checkedVal;
  }

  /**
  * Open modal
  * @param content modal content
  */
  editModal(content: any, id: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
    var listData = this.ListJsDatas.filter((data: { id: any; }) => data.id === id);
    var updatebtn = document.getElementById('add-btn') as HTMLElement
    updatebtn.innerHTML = 'Update'
    this.listJsForm.controls['customer_name'].setValue(listData[0].customer_name);
    this.listJsForm.controls['email'].setValue(listData[0].email);
    this.listJsForm.controls['phone'].setValue(listData[0].phone);
    this.listJsForm.controls['date'].setValue(listData[0].date);
    this.listJsForm.controls['status'].setValue(listData[0].status);
    this.listJsForm.controls['ids'].setValue(listData[0].id);
  }
  /**
  * Sort table data
  * @param param0 sort the column
  *
  */
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



  submitData() {

    this.pendingService.submitEntries(this.modalTableData).subscribe((res: any)=> {

      if(res["status"] == "success") {
        this.toastService.show(res["message"], { classname: 'bg-success text-white', delay: 3000 });
        setTimeout(() => {
          window.location.reload()
        }, 1000);
        
      }
      else {
        // console.log(res);
        // this.toastService.show(res["message"], { classname: 'bg-warning text-white', delay: 3000 });
      }

    })

  }


  ngAfterViewInit() {
    // $(document).ready(function () {
    //   $('#employeeTable').DataTable({
    //     // Enable sorting and searching
    //     order: [[0, 'asc']], // Sort by the first column (0) in ascending order
    //     searching: true,      // Enable searching
    //   });
    // });
  }


  formatForTable(dateStr: string): string {
    const date = new Date(dateStr);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }


onDateChange(event: any, index: number): void {
  const enteredDate = event.target.value; // Get the entered date from input field
  const row = this.modalTableData[index]; // Get the specific row using the index
  const originalCodeIssueTime = row.codeIssueTime; // Get the original codeIssueTime

  console.log('Entered Date:', enteredDate);
  console.log('Original Code Issue Time:', originalCodeIssueTime);

  // Ensure tempData exists for this index
  if (!this.tempData[index]) {
    this.tempData[index] = { enteredDate: originalCodeIssueTime };
  }

  // Compare the entered date (as string) with the original codeIssueTime
  if (enteredDate < originalCodeIssueTime) {
    alert('Entered date is less than the allowed codeIssueTime!');
    event.target.value = this.tempData[index].enteredDate; // Reset input field
  } else {
    // Store only valid entries in tempData (do not modify modalTableData yet)
    this.tempData[index].enteredDate = enteredDate;
  }
}
  
}
