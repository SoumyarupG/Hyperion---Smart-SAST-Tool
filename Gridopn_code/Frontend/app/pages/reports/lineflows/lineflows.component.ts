import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ReportsService } from 'src/app/core/services/reports.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lineflows',
  templateUrl: './lineflows.component.html',
  styleUrls: ['./lineflows.component.scss']
})
export class LineflowsComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  dayForm!: UntypedFormGroup; // Define the form group
  downloadLink: string = '';  // To store the download link
  loading: boolean = false;

  lineflows_data: any = []
  lineflows_title: any = "LINEFLOWS"

  MarketplaceChart: any;


  constructor( private reportsService: ReportsService,private formBuilder: UntypedFormBuilder) {}



  ngOnInit(): void {

    // Initialize the form group
    this.dayForm = this.formBuilder.group({
      dayRange: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }] // Initialize the control for the date range picker
    });

    this.breadCrumbItems = [
      { label: 'Reports' },
      { label: 'LineFlows Report', active: true }
    ];
    /**
     * BreadCrumb
     */

    this._marketplaceChart('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info", "--vz-light", "--vz-dark", "--vz-muted", "--vz-secondary", "--vz-tertiary", "--vz-blue", "--vz-green", "--vz-red", "--vz-yellow", "--vz-purple", "--vz-pink", "--vz-lime", "--vz-teal", "--vz-orange", "--vz-cyan"]');

  }

  fetchLineFlowReport() {
    this.loading = true;
    const formData = {
      // state: this.validationform.get('state')!.value,
      fromDate: this.dayForm.get('dayRange')?.value["from"].toLocaleDateString('en-GB'),
      toDate: this.dayForm.get('dayRange')?.value["to"].toLocaleDateString('en-GB')
    };

    this.downloadLink = '';

    this.reportsService.lineFlowReport(formData).subscribe((res: any) => {

        // console.log(data);
        // console.log(res)
        this.loading = false;
        

        if(res.status == 'success') {
          // console.log(res['message'])
          this.downloadLink = res.file_link;
          // console.log(this.downloadLink)
          console.log(res)
          this.MarketplaceChart.series = res["data"];
          this.lineflows_title = res["title"];

          Swal.fire({text:'Data has been Fetched!',confirmButtonColor: 'rgb(3, 142, 220)'});

        }

        else {
          console.log(res['error'])
          Swal.fire({text:'There is some Problem in Loading the Data, Please contact SRLDC IT!',confirmButtonColor: 'rgb(3, 142, 220)'});
        }
        // this.day_data = data["day"];
      //   this.week_data = data["week"];
      //   this.month_data = data["month"];
        // this._basicHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
      //   this._basicWeekHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
      //   this._basicMonthHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
        
        // this.dataArrived = true;
  
      }) 
  }

   // Function to download the report
   downloadReport(): void {
    this.reportsService.downloadLineFlowsReport(this.downloadLink).subscribe(
      (response: Blob) => {
        // Create a Blob from the response
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a link element for downloading
        const downloadLink = document.createElement('a');
        const url = window.URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = 'lineflows_report.xlsx';  // Specify file name for download

        // Append the link to the document and trigger the download
        downloadLink.click();
        window.URL.revokeObjectURL(url);  // Clean up URL
      },
      (error) => {
        console.error('Error downloading the file', error);
      }
    );
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



private _marketplaceChart(colors: any) {
  colors = this.getChartColorsArray(colors);
  this.MarketplaceChart = {
      series:this.lineflows_data,
      xaxis: {
          type: 'datetime'
        },  
        yaxis: {
          labels: {
              show: true,
              formatter: function (y: number) {
                  return y;
              },
              style: {
                  colors: '#333', // Adjust y-axis label color as needed
                  fontSize: '12px' // Adjust the label font size
              }
          }
      },
      chart: {
          height: 350,
          type: 'line',
          zoom: {
              enabled: false
          },
          toolbar: {
              show: true
          }
      },
      // title: {
      //     text: this.mape_title,
      //     align: 'center',
      //     margin: 10,
      //     offsetX: 0,
      //     offsetY: 0,
      //     floating: false,
      //     style: {
      //       fontSize:  '14px',
      //       fontWeight:  'bold',
      //       fontFamily:  undefined,
      //       color:  '#263238'
      //     },
      // },
      dataLabels: {
          enabled: false
      },
     
      stroke: {
          curve: 'smooth',
          width: 3
      },
     
      
      colors: colors,
      
  };
}

private getChartColorsArray(colors: any) {
  // console.log(colors)
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






}
