import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/account/login/toast-service';
import { DayAheadForecastService } from 'src/app/core/services/day-ahead-forecast.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import * as jspreadsheet from "jspreadsheet-ce";
import { IntradayForecastService } from 'src/app/core/services/intraday-forecast.service';


const today = new Date();


@Component({
  selector: 'app-view-intraday',
  templateUrl: './view-intraday.component.html',
  styleUrls: ['./view-intraday.component.scss']
})
export class ViewIntradayComponent {

  userData: any;
  dataArrived: boolean = false;

  loading: boolean = false;

  // data: number[][] = new Array<Array<number>>();

  submit!: boolean;

  formsubmit!: boolean;

  data: any[][] = [];

  uploadTime: any = '-'
  uploadDate: any = '-'
  revision: any = '-'
  uploadedBy: any = '-'

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

  constructor(private modalService: NgbModal, private formBuilder: UntypedFormBuilder,public toastService: ToastService, private TokenStorageService: TokenStorageService , private intradayForecast: IntradayForecastService ,private datePipe: DatePipe) { }



  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Past Uploads' },
      { label: 'View Intraday Forecast', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    this.validationform = this.formBuilder.group({
      // firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // lastName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // userName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // city: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // zip: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      fetchDate: [today],
      revisions: ['', [Validators.required]]
    });



    



    if (this.userData?.role === 'f_user') {

      const st = this.userData.state_id;

      this.validationform.get('state')!.setValue(st);   // auto-fill state
      this.validationform.get('state')!.disable();
      this.fetchDataBasedOnDate(this.validationform.get('state')!.value, this.validationform.get('fetchDate')!.value);      // lock state dropdown
    }

      if (!this.hasRole(['admin'])) {
      this.validationform.get('state')?.disable();
      }

    this.validationform.get('fetchDate')!.valueChanges.subscribe((date) => {
      if (date) {
        this.fetchDataBasedOnDate(this.validationform.get('state')!.value, date);
      }
      
    });

    this.validationform.get('state')!.valueChanges.subscribe((state) => {
      if (state) {
        // console.log(state);

        this.fetchDataBasedOnDate(state, this.validationform.get('fetchDate')!.value);
      }
      
    });






    // end of ngOnInit
  }

  fetchDataBasedOnDate(state: string, date: Date): void {
    // Replace with your API endpoint

    // Make an API call
    this.intradayForecast.fetchRevisions(state, date.toLocaleDateString('en-GB')).subscribe((data: any) => {
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
        this.intradayForecast.fetchRevisionsData(this.validationform.get('state')!.value, this.validationform.get('fetchDate')!.value.toLocaleDateString('en-GB'), this.validationform.get('revisions')!.value).subscribe((data: any)=> {
          
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
              this.uploadDate = data["date"]
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

    validSubmit() {
      this.submit = true;
    }

    get form() {
      return this.validationform.controls;
    }

    formSubmit() {
      this.formsubmit = true;
    }


    downloadReport(): void {
      this.intradayForecast.downloadIntradayReport(this.validationform.get('state')!.value, this.validationform.get('fetchDate')!.value.toLocaleDateString('en-GB'), this.validationform.get('revisions')!.value).subscribe(
        (response: Blob) => {
          // Create a Blob from the response
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          // console.log(response)
          // Create a link element for downloading
          const downloadLink = document.createElement('a');
          const url = window.URL.createObjectURL(blob);

          const state = this.stateDict[this.validationform.get('state')!.value];
          const fetchDate = new Date(this.validationform.get('fetchDate')!.value).toLocaleDateString('en-GB');
          const revisions = this.validationform.get('revisions')!.value['revision'];
          // console.log(revisions);
            
          downloadLink.href = url;
          downloadLink.download = `Intraday_Forecast_${state}_${fetchDate}_Rev${revisions}.xlsx`;  // Specify file name for download
  
          // Append the link to the document and trigger the download
          downloadLink.click();
          window.URL.revokeObjectURL(url);  // Clean up URL
        },
        (error) => {
          console.error('Error downloading the file', error);
        }
        
      );
    }
  

    ngAfterViewInit() {
      jspreadsheet(this.spreadsheet.nativeElement, {
      data: this.data,
      // freezeColumns: 2,
      footers: [[ ' ','Total MUs', '=ROUND(SUM(C1:C96)/4000,2)' , '=ROUND(SUM(D1:D96)/4000,2)' , '=ROUND(SUM(E1:E96)/4000,2)','=ROUND(SUM(F1:F96)/4000,2)' , '=ROUND(SUM(G1:G96)/4000,2)' , '=ROUND(SUM(H1:H96)/4000,2)','=ROUND(SUM(I1:I96)/4000,2)' , '=ROUND(SUM(J1:J96)/4000,2)' , '=ROUND(SUM(K1:K96)/4000,2)','=ROUND(SUM(L1:L96)/4000,2)' , '=ROUND(SUM(M1:M96)/4000,2)' , '=ROUND(SUM(N1:N96)/4000,2)','=ROUND(SUM(O1:O96)/4000,2)' , '=ROUND(SUM(P1:P96)/4000,2)' , '=ROUND(SUM(Q1:Q96)/4000,2)','=ROUND(SUM(R1:R96)/4000,2)' , '=ROUND(SUM(S1:S96)/4000,2)' , '=ROUND(SUM(T1:T96)/4000,2)', '=ROUND(SUM(U1:U96)/4000,2)' ]],
  
      tableOverflow: true,
      tableWidth: '1200px',
      tableHeight: '400px',
      columns: [
        {
          type: 'numeric',
          title: 'Block',
          width: '50'
        },
        {
            type: 'text',
            title: 'Period',
            width: '120',
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
                colspan: 2, 
                
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
                colspan: 2,
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

    lazyLoading: true, 
  
    updateTable(instance, cell, colIndex, rowIndex, value, displayedValue, cellName) {
  
      if(colIndex == 2) {
        const exactValue = value.toString()
        console.log(typeof value);
        if(typeof value !== 'number' && Number.isNaN(Number.parseInt(exactValue))){
          cell.style.background = '#ffcccb'
          Swal.fire({text:'Your Data has some errors, They are highlighted. Please check and Update',confirmButtonColor: 'rgb(3, 142, 220)',});
        }
  
        const modifiedValue = value.toString()
      // console.log(modifiedValue)
      if(typeof modifiedValue === "number" || !Number.isNaN(Number.parseFloat(modifiedValue))) {
        // console.log("enter the dragon!")
        cell.style.background = 'white';
      }
      
      
        
        
      }
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

              hasRole(roles: string[]): boolean {
        if (!this.userData || !this.userData.role) return false;
        const role = this.userData.role.toLowerCase();
        return roles.some(r => r.toLowerCase() === role);
      }
        

}
