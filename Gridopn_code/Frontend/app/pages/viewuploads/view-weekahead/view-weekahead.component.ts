import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/account/login/toast-service';
// import { DayAheadForecastService } from 'src/app/core/services/day-ahead-forecast.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import * as jspreadsheet from "jspreadsheet-ce";
import { WeekAheadForecastService } from 'src/app/core/services/week-ahead-forecast.service';


@Component({
  selector: 'app-view-weekahead',
  templateUrl: './view-weekahead.component.html',
  styleUrls: ['./view-weekahead.component.scss']
})
export class ViewWeekaheadComponent {


  dataArrived: boolean = false;
  userData: any;

  // data: number[][] = new Array<Array<number>>();

  submit!: boolean;

  formsubmit!: boolean;

  data: any[][] = [];

  uploadTime: any = '-'
  uploadDate: any = '-'
  revision: any = '-'
  uploadedBy: any = '-'
  fromDate: any = '-'
  toDate: any = '-';


  loading: boolean = false;

  stateDict: { [key: string]: string } = {
    '1': 'Karnataka',
    '2': 'Tamilnadu',
    '3': 'Telangana',
    '4': 'Andhra Pradesh',
    '5': 'Kerala',
    '7': 'Pondicherry'
  };


  breadCrumbItems!: Array<{}>;
  validationform!: UntypedFormGroup;

  revisionsData: any[] = [];

  @ViewChild("spreadsheet", {static: true}) spreadsheet !: ElementRef<any>;

  constructor(private modalService: NgbModal, private formBuilder: UntypedFormBuilder,public toastService: ToastService, private TokenStorageService: TokenStorageService , private weekAheadForecast: WeekAheadForecastService ,private datePipe: DatePipe) { }



  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Past Uploads' },
      { label: 'Week Ahead Forecast', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    this.validationform = this.formBuilder.group({
      // firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // lastName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // userName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // city: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // zip: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      fetchDate: [{"from": this.getNextMonday(), "to":new Date(this.getNextMonday().getTime() + 6*24 * 60 * 60 * 1000) }],
      revisions: ['', [Validators.required]]
    });



    



    if(this.userData['role'] == 'user'){

      

      // console.log("Rinnegan")

      // console.log(this.state_id_dict[this.userData['username']]);
    
      this.validationform.get('state')!.setValue(this.userData['state_id']);
      this.validationform.get('state')!.disable();

      this.fetchDataBasedOnDate(this.validationform.get('state')!.value, this.validationform.get('fetchDate')!.value["from"], this.validationform.get('fetchDate')!.value["to"]);

    }

    this.validationform.get('fetchDate')!.valueChanges.subscribe((date) => {
      // console.log(date);
      if (date) {
        this.fetchDataBasedOnDate(this.validationform.get('state')!.value, this.validationform.get('fetchDate')!.value["from"], this.validationform.get('fetchDate')!.value["to"]);
      }
      
    });

    this.validationform.get('state')!.valueChanges.subscribe((state) => {
      if (state) {
        // console.log(state);

        this.fetchDataBasedOnDate(state, this.validationform.get('fetchDate')!.value["from"], this.validationform.get('fetchDate')!.value["to"]);
      }
      
    });






    // end of ngOnInit
  }

  fetchDataBasedOnDate(state: string, from_date: Date, to_date: Date): void {
    // Replace with your API endpoint

    // Make an API call
    this.weekAheadForecast.fetchRevisions(state, from_date.toLocaleDateString('en-GB'), to_date.toLocaleDateString('en-GB')).subscribe((data: any) => {
      // Update the dropdownData array with the response
      if(data["status"] == "success") {
        this.revisionsData = data['revisions'];
        // this.validationform.get('revisions')!.enable();
        // 🔑 Reset revision value every time new revisions are loaded
        this.validationform.get('revisions')!.reset("");
        this.validationform.get('revisions')!.enable();
      }
      else {
        this.validationform.get('revisions')!.reset("");
        this.validationform.get('revisions')!.disable();

        this.uploadTime = '-';
        this.fromDate = '-';
        this.toDate = '-';
        this.revision = '-';
        this.uploadedBy = '-';
        this.spreadsheet.nativeElement.jexcel.setData([]);

        setTimeout(() => {
          Swal.fire({
            text: data['message'],
            icon: 'warning',
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'OK'
          });
        }, 1500);
        

      }
      
    });
  }

    fetchData() {
      this.loading = true;
      if(this.validationform.valid) {
        // console.log("ngsubmit hit!")
        this.dataArrived = false;
        this.weekAheadForecast.fetchRevisionsData(this.validationform.get('state')!.value, this.validationform.get('fetchDate')!.value["from"].toLocaleDateString('en-GB'),this.validationform.get('fetchDate')!.value["to"].toLocaleDateString('en-GB'), this.validationform.get('revisions')!.value).subscribe((data: any)=> {
          this.loading = false;
          if(data["status"] == "failure") {

            Swal.fire({
              text: data['message'],
              icon: 'warning',
              confirmButtonColor: 'rgb(3, 142, 220)',
              confirmButtonText: 'OK'
            });

            

          }

          else {
            if(data["status"] == "success") {
              // console.log(typeof data["data"])
              // console.log(data)
              this.spreadsheet.nativeElement.jexcel.setData(data["data"])
              // this.uploadDate = data["date"]
              this.fromDate = data["from_date"]
              this.toDate = data["to_date"]
              this.uploadTime = data["time"]
              this.revision = data["revision"]
              this.uploadedBy = data["role"]
              this.dataArrived = true;

            }
          }
          
        })


      }




      else {
        // console.log("Form is invalid!")
      }
      
      

    }


    downloadFile(): void {
        if (this.validationform.valid) {
          // FIX 1: Updated method name to downloadWeekAheadReport
          this.weekAheadForecast.downloadWeekAheadReport(
            this.validationform.get('state')!.value,
            this.validationform.get('fetchDate')!.value["from"].toLocaleDateString('en-GB'),
            this.validationform.get('fetchDate')!.value["to"].toLocaleDateString('en-GB'),
            this.validationform.get('revisions')!.value
          ).subscribe(
            (response: Blob) => {
              const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              const downloadLink = document.createElement('a');
              const url = window.URL.createObjectURL(blob);

              const state = this.stateDict[this.validationform.get('state')!.value];
              const fetchFromDate = new Date(this.validationform.get('fetchDate')!.value['from']).toLocaleDateString('en-GB');
              const fetchToDate = new Date(this.validationform.get('fetchDate')!.value['to']).toLocaleDateString('en-GB');
              const revisions = this.validationform.get('revisions')!.value;

              downloadLink.href = url;
              // Updated filename logic if needed
              downloadLink.download = `Week_Ahead_Forecast_${state}_${fetchFromDate}-${fetchToDate}_Rev${revisions}.xlsx`;

              downloadLink.click();
              window.URL.revokeObjectURL(url);
            },
            // FIX 2: Added type 'any' to error
            (error: any) => {
              console.error('Error downloading the file', error);
              this.toastService.show('Error downloading file', { classname: 'bg-danger text-white', delay: 3000 });
            }
          );
        }
      }

    validSubmit() {
      this.submit = true;
    }

    get form() {
      return this.validationform.controls;
    }

    formSubmit() {
      this.formsubmit = true;
    }

    getNextMonday() {
      const today = new Date();
      const currentDayOfWeek = today.getDay();
      const daysUntilNextMonday = currentDayOfWeek === 1 ? 7 : 1 - currentDayOfWeek; // Calculate the number of days until the next Monday
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilNextMonday); // Add the days to the current date
      return nextMonday;
    }
    

    ngAfterViewInit() {
      jspreadsheet(this.spreadsheet.nativeElement, {
      data: this.data,
      // freezeColumns: 2,
      footers: [[ ' ', ' ','Total MUs', '=ROUND(SUM(D1:D672)/4000,2)' , '=ROUND(SUM(E1:E672)/4000,2)' , '=ROUND(SUM(F1:F672)/4000,2)','=ROUND(SUM(G1:G672)/4000,2)' , '=ROUND(SUM(H1:H672)/4000,2)' , '=ROUND(SUM(I1:I672)/4000,2)','=ROUND(SUM(J1:J672)/4000,2)' , '=ROUND(SUM(K1:K672)/4000,2)' , '=ROUND(SUM(L1:L672)/4000,2)','=ROUND(SUM(M1:M672)/4000,2)' , '=ROUND(SUM(N1:N672)/4000,2)' , '=ROUND(SUM(O1:O672)/4000,2)','=ROUND(SUM(P1:P672)/4000,2)' , '=ROUND(SUM(Q1:Q672)/4000,2)' , '=ROUND(SUM(R1:R672)/4000,2)','=ROUND(SUM(S1:S672)/4000,2)' , '=ROUND(SUM(T1:T672)/4000,2)' , '=ROUND(SUM(T1:T672)/4000,2)', '=ROUND(SUM(U1:U672)/4000,2)' ]],
  
      tableOverflow: true,
      tableWidth: '1200px',
      tableHeight: '400px',
      columns: [
        {
          type: 'calendar',
          title: 'Date',
          width: '120'
        },
        {
            type: 'numeric',
            title: 'Block',
            width: '50',
            readOnly: true
            
        },
        {
            type: 'text',
            title: 'Period',
            width: '150',
            readOnly: true
            
        },
        {
            type: 'numeric',
            title: 'MW',
            width:'150',
            decimal: '.',
            mask: '0.00'
        },
        {
          type: 'numeric',
          title: 'MW',
          width:'100',
          decimal: '.',
            mask: '0.00'
      },
      {
        type: 'numeric',
        title: 'MW',
        width:'100',
        decimal: '.',
        mask: '0.00'
    },
      {
        type: 'numeric',
        title: 'MW',
        width:'100',
        decimal: '.',
        mask: '0.00'
      },
      {
        type: 'numeric',
        title: 'MW',
        width:'100',
        decimal: '.',
        mask: '0.00'
      },
    {
      type: 'numeric',
      title: 'MW',
      width:'100',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'180',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'100',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'225'
    },{
      type: 'numeric',
      title: 'MW',
      width:'225',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'225',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'100',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'300',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'175',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'175',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'300',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'300',
      decimal: '.',
      mask: '0.00'
    },{
      type: 'numeric',
      title: 'MW',
      width:'300',
      decimal: '.',
      mask: '0.00'
    },
    {
      type: 'numeric',
      title: 'MVar',
      width:'300',
      decimal: '.',
      mask: '0.00'
      
    },
    ],
    nestedHeaders:[
      
        [
            {
                title: 'Time',
                colspan: 3, 
                
            },
            {
              title: 'Forecasted Generation/ Availability',
              colspan: 12, 
              
              
          },
          {
            title: 'Gap between Demand & Availability (G) = (A)-(F)  Surplus(-) / Deficit (+)',
            colspan: 1, 
            
            
        },
        {
          title: 'Proposed Procurement',
          colspan: 2, 
          
        },
        {
          title: 'Shortages after day ahead procurement from market (J) =(G)-(H+I)  Surplus(-) / Deficit (+)',
          colspan: 1, 
          
      },
      {
        title: 'Relief through planned restrictions/ rostering/ power cuts (K)',
        colspan: 1, 
        
      },
      {
        title: 'Additional Load shedding proposed (L) = (J)-(K) Surplus(-) / Deficit (+)',
        colspan: 1, 
        
      },
      {
        title: 'Reactive Power Forecast',
        colspan: 1, 
        
      },
  
        ],
        [
            {
                title: '',
                colspan: 3,
            },
            {
              title: 'Forecasted Demand (A)',
              colspan: 1,
          },
          
  
            {
              title: 'From its own sources (Excluding Renewable)',
              colspan: 4, 
              
          },
          {
            title: 'From Renewable Sources',
            colspan: 4, 
            
        },
        {
          title: 'From ISGS & Other LTA & MTOA',
          colspan: 1, 
          
        },
        {
          title: 'From Bilateral Transaction (Advance + FCFS)',
          colspan: 1, 
          
        },
        {
          title: 'Total Availability',
          colspan: 1, 
          
        }, 
        {
          title: '',
          colspan: 1, 
          
        },  
        {
          title: 'Under Bilateral Transaction (Day Ahead+ Contingency) (H)',
          colspan: 1, 
          
        },
        {
          title: 'Through Power Exchange (I)',
          colspan: 1, 
          
        },
        {
          title: '',
          colspan: 1, 
          
        },   {
          title: '',
          colspan: 1, 
          
        },   {
          title: '',
          colspan: 1, 
          
        },  
        {
          title: '',
          colspan: 1, 
          
        },  
        ],
        [
          {
              title: '',
              colspan: 3,
          },
          {
            title: '',
            colspan: 1,
        },
        
          {
            title: 'Thermal (Coal + Lignite)',
            colspan: 1, 
            
        },
        {
          title: 'Gas',
          colspan: 1, 
          
      },
        {
          title: 'Hydro',
          colspan: 1, 
          
      },
        {
          title: 'Total (B)',
          colspan: 1, 
          
      },
        {
        title: 'Solar',
        colspan: 1, 
        
        },
        {
          title: 'Wind',
          colspan: 1, 
          
        },
        {
          title: 'Other RES (biomass etc.)',
          colspan: 1, 
          
        },
        {
          title: 'Total (C)',
          colspan: 1, 
          
        },
        {
          title: '',
          colspan: 1, 
          
        },
        {
          title: '',
          colspan: 1, 
          
        },
        {
          title: '',
          colspan: 1, 
          
        },
        {
          title: '',
          colspan: 1, 
          
        },  
        {
          title: '',
          colspan: 1, 
          
        },
        {
          title: '',
          colspan: 1, 
          
        },
        {
          title: '',
          colspan: 1, 
          
        },   {
          title: '',
          colspan: 1, 
          
        },   {
          title: '',
          colspan: 1, 
          
        },    
  
        {
          title: '',
          colspan: 1, 
          
        },  
          
      ],
    ],
  
    updateTable(instance, cell, colIndex, rowIndex, value, displayedValue, cellName) {
  
      // if(colIndex == 3) {
      //   const exactValue = value.toString()
      //   console.log(typeof value);
      //   if(typeof value !== 'number' && Number.isNaN(Number.parseInt(exactValue))){
      //     cell.style.background = '#ffcccb'
      //     Swal.fire({text:'Your Data has some errors, They are highlighted. Please check and Update',confirmButtonColor: 'rgb(3, 142, 220)',});
      //   }
  
      //   const modifiedValue = value.toString()
      // // console.log(modifiedValue)
      // if(typeof modifiedValue === "number" || !Number.isNaN(Number.parseFloat(modifiedValue))) {
      //   // console.log("enter the dragon!")
      //   cell.style.background = 'white';
      // }
      
      
        
        
      // }
    },
  
   
  
    // onchange(element, cell, colIndex, rowIndex, newValue, oldValue) {
    //   // console.log('Rinnegan')
    //   // console.log(oldValue)
    //   // console.log(typeof newValue);
  
    //   // if(typeof newValue === 'number' ){
    //   //   cell.style.background = 'white';
    //   // }
  
    //   // console.log(Number.is(newValue));
    //   // const stringValue = cellValue.toString();
    //   const modifiedValue = newValue.toString()
    //   console.log(modifiedValue)
    //   console.log(typeof modifiedValue === "number" || !Number.isNaN(Number.parseFloat(modifiedValue)));
    //   if(typeof modifiedValue === "number" || !Number.isNaN(Number.parseFloat(modifiedValue))) {
    //     cell.style.background = 'blue';
    //   }
  
    // },
  
    
    
    
    
  
    
  
    
    
    });


        
  }



}
