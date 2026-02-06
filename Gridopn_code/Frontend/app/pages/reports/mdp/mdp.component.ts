import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ReportsService } from 'src/app/core/services/reports.service';
import { ToastService } from 'src/app/core/services/toast-service';

@Component({
  selector: 'app-mdp',
  templateUrl: './mdp.component.html',
  styleUrls: ['./mdp.component.scss']


})




export class MdpComponent {

  MarketplaceChartAF: any;

  breadCrumbItems!: Array<{}>;
  elementForm!: UntypedFormGroup; // Define the form group
  loading: boolean = false;
  submit!: boolean;
  selectValue: any = [];
  demand_data: any = []
   fa_compare_title = "MDP Data"
  

  constructor( private reportsService: ReportsService,private formBuilder: UntypedFormBuilder,public toastService: ToastService) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Reports' },
      { label: 'MDP Data', active: true }
    ];
    /**
     * BreadCrumb
     */

    // Initialize the form group
    this.elementForm = this.formBuilder.group({
      elements: [[],[this.validateListItemsWithRequired(/^[a-zA-Z0-9\s@#$%^&*()_+\-=[\]{}|;':",.<>?/]+$/)]],
      dayRange: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }] // Initialize the control for the date range picker
    });


    


    this.reportsService.FetchDescription().subscribe((data: any) => {
      if (data['status'] === 'success') {
        const elementsList = data['data']; // API response
        this.selectValue = elementsList; // Populate dropdown options
        
        // Do not set any initial value for 'elements' to keep it unselected
        this.elementForm.patchValue({
          elements: [] // Ensure no preselection
        });
      }
    });

    this._actualForecastmarketplaceChart('["--vz-primary","--vz-success", "--vz-warning", "--vz-danger"]');



    



  }



  validateListItemsWithRequired(pattern: RegExp) {
    return (control: AbstractControl) => {
      const value = control.value;
  
      // Check if the list is empty
      if (!value || !Array.isArray(value) || value.length === 0) {
        return { required: true }; // Throw required error
      }
  
      // Check if any item in the list is invalid
      for (const item of value) {
        if (!pattern.test(item)) {
          return { invalidItem: true }; // Throw invalid item error
        }
      }
  
      return null; // Validation passed
    };
  }

  getPreviousMonthDates() {
    // Get the current date
    const currentDate = new Date();

    // Calculate the previous month's starting date
    const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Calculate the previous month's ending date
    const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Format the dates as strings (in "YYYY-MM-DD" format)
    const previousMonthStartDateString = previousMonthStartDate.toISOString().split('T')[0];
    const previousMonthEndDateString = previousMonthEndDate.toISOString().split('T')[0];

    return {
        startDate: previousMonthStartDate,
        endDate: previousMonthEndDate
    };
}

get form() {
  return this.elementForm.controls;
}

validSubmit() {
  this.submit = true;
}

fetchElementData() {

  if(this.elementForm.valid) {
    const formData = {
     elementList: this.elementForm.get('elements')!.value,
      fromDate: this.elementForm.get('dayRange')?.value["from"].toLocaleDateString('en-GB'),
      toDate: this.elementForm.get('dayRange')?.value["to"].toLocaleDateString('en-GB')
    };

    // console.log(formData);

    this.loading = true;

    this.reportsService.fetchDescriptionBasedData(formData).subscribe((res: any) => {
      this.loading = false;
      if(res["status"] == "failure") {

        this.MarketplaceChartAF.series = [];
        this.fa_compare_title = res["title"];
          
      }

      else {

        // console.log("Data Received!") 
                    // console.log(res);

                    this.MarketplaceChartAF.series = res["results"];
                    this.fa_compare_title = res["title"];
                    // console.log(this.MarketplaceChart.series);
                    // console.log(this.MarketplaceChart.title)

                    if("message" in res) {
                        this.toastService.show(res["message"], { classname: 'bg-success text-white', delay: 3000 });

                    }

          


      }
  })
    


  }

  else {
    console.log("Failed validation")
  }

}


private getChartColorsArray(colors: any) {
  colors = JSON.parse(colors);
  return colors.map(function (value: any) {
      var newValue = value.replace(" ", "");
      if (newValue.indexOf(",") === -1) {
          var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
          if (color) {
              color = color.replace(" ", "");
              return color;
          }
          else return newValue;;
      } else {
          var val = value.split(',');
          if (val.length == 2) {
              var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
              rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
              return rgbaColor;
          } else {
              return newValue;
          }
      }
  });
}



private _actualForecastmarketplaceChart(colors: any) {
  colors = this.getChartColorsArray(colors);
  
  this.MarketplaceChartAF = {
      series: this.demand_data,  // Ensure timestamps are in UTC in your demand_data
      xaxis: {
          type: 'datetime',
          labels: {
              formatter: function (val: string) {
                  if (!val) return "";  // Return an empty string if `val` is undefined
                  const date = new Date(val);
                  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
              },
              style: {
                  colors: '#333',
                  fontSize: '12px'
              }
          },
          tooltip: {
              enabled: true,
              formatter: function (val: string) {
                  if (!val) return "";  // Return an empty string if `val` is undefined
              const date = new Date(val);
              return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
              }
          }
      },
      yaxis: {
          labels: {
              show: true,
              formatter: function (y: number) {
                  if(y == 0){
                      return 0;
                  }
                  return y + " MW";  // Adjust label to display MW
              },
              style: {
                  colors: '#333',
                  fontSize: '12px'
              }
          },

      },
      
      chart: {
          height: 350,
          type: 'line',
          zoom: {
              enabled: true
          },
          toolbar: {
              show: true
          }
      },


      
      stroke: {
          curve: 'smooth',
          width: 3, 
      },
      colors: colors,
  };
}



}
