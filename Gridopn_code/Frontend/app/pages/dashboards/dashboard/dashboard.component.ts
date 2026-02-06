import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { ToastService } from 'src/app/core/services/toast-service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

/**
 * Ecommerce Component
 */
export class DashboardComponent implements OnInit {
    comparisonChartInstance: any;
    mapeChartInstance: any;

    comparisonEchartOptions: any = {};
    mapeEchartOptions: any = {};

    // ===== RAW DATA FOR CSV EXPORT =====
    mapeRawSeries: any[] = [];
    comparisonRawSeries: any[] = [];




  basicHeatmapChart: any;
  basicWeekHeatmapChart: any;
  basicMonthHeatmapChart: any;
  basicYearHeatmapChart: any;
  basicIntradayHeatmapChart: any;
  basicMailStatusHeatmapChart: any;
//   basicMailStatusHeatmapChart: any;


  MarketplaceChart: any;
  MarketplaceChartAF: any;
  breakupMarketplaceChart: any;
  multiAxisForecastChart: any;

  dataArrived: boolean = false;
  dataMailStatusArrived: boolean = false;

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submit!: boolean;
  afSubmit! : boolean
  formsubmit!: boolean;
  breakupsubmit!: boolean;



  loading: boolean = false;
  weekloading: boolean = false;
  monthloading: boolean = false;
  yearloading: boolean = false;
  intradayLoading: boolean = false;
  mailStatusLoading: boolean = false;
  mapeloading: boolean = false;
  breakuploading: boolean = false;
  afloading: boolean = false;

//   mailStatusLoading = false;


  public day_data:any = [];
  public week_data: any = [];
  public month_data: any = [];
  public year_data: any = [];
  public intraday_data: any = [];
  public mail_status_data: any = [];
  public forecast_data:any = [];
  public mape_raw_data:any = [];
  public actual_data:any = [];


  selectedOption: string = 'day';

  mape_day_ahead: any = [];
  dates_list: any = []
  mape_week_ahead: any = []
  mape_month_ahead: any = []
  mape_data: any = []
  multiaxis_data: any = []
  demand_data: any = []
  mape_title: any = "MAPE"
  breakup_title: any = "Breakup"
  multiaxis_title: any = ""
  fa_compare_title = "Comparison"
  userData: any;



  state_id_dict: any = {'kar_state': 1, 'tn_state':2, 'tg_state': 3, 'ap_state': 4, 'ker_state':5, 'pondy_state': 7}

  dayForm!: UntypedFormGroup; // Define the form group
  weekForm!: UntypedFormGroup; // Define the form group
  monthForm!: UntypedFormGroup; // Define the form group
  yearForm!: UntypedFormGroup; // Define the form group
  intradayForm!: UntypedFormGroup; // Define the form group
  mailStatusForm!: UntypedFormGroup; // Define the form group


  validationform!: UntypedFormGroup;
  faform!: UntypedFormGroup;
  breakupform!: UntypedFormGroup;
  userReady: boolean = false;


  constructor(private dashboardService: DashboardService, private formBuilder: UntypedFormBuilder, private TokenStorageService: TokenStorageService, public toastService: ToastService, private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */




     this.userData = this.TokenStorageService.getUser();

        // console.log("INITIAL USER FROM STORAGE:", this.userData);

        const waitForUser = setInterval(() => {
            this.userData = this.TokenStorageService.getUser();

            if (this.userData) {
            // console.log("USER LOADED SUCCESSFULLY:", this.userData);
            this.userReady = true;
            clearInterval(waitForUser);
            this.cd.detectChanges();
            }
        }, 100);

        // console.log("RAW TOKEN USER:", JSON.stringify(this.userData));


    if (this.userData.role === 'admin') {
    this.selectedOption = 'day';
    }







    this.breadCrumbItems = [
      { label: 'Dashboards' },
      { label: 'Dashboard', active: true }
    ];

    this._marketplaceChart('["--vz-primary","--vz-success", "--vz-warning", "--vz-info"]');


    this._actualForecastmarketplaceChart('["--vz-primary","--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]');

    this._multiAxisForecastChart('["--vz-primary","--vz-success", "--vz-warning", "--vz-danger"]');


          // Initialize the form group
          this.dayForm = this.formBuilder.group({
            dayRange: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }] // Initialize the control for the date range picker
          });
    
        this.weekForm = this.formBuilder.group({
        weekRange: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }] // Initialize the control for the date range picker
        });
    
        this.monthForm = this.formBuilder.group({
            monthRange: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }] // Initialize the control for the date range picker
            });
        

        this.yearForm = this.formBuilder.group({
            yearRange: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }] // Initialize the control for the date range picker
            });
        
        this.intradayForm = this.formBuilder.group({
            intradayRange: [{"from": this.getLast30DaysDates()["startDate"], "to":this.getLast30DaysDates()["endDate"] }] // Initialize the control for the date range picker
            });

        this.mailStatusForm = this.formBuilder.group({
                mailStatusDayRange: [{
                    from: new Date(this.getLast30DaysDates()["startDate"]),
                    to: new Date(this.getLast30DaysDates()["endDate"])
                }]
        });


        
        

                
    this.dashboardService.fetchDayUploadStatus().subscribe((data: any) => {

        if (data && data["day"] && data["week"] && data["month"] && data["year"] && data["intraday"]) {

             //   console.log(data);
      this.day_data = data["day"];
      this.week_data = data["week"];
      this.month_data = data["month"];
      this.year_data = data["year"];
      this.intraday_data = data["intraday"]
      this.mail_status_data = data["mail_status"]

    // //   console.log(data);



      // Updating the form controls with the fetched dates
        this.dayForm.patchValue({
            dayRange: { from: new Date(data["day_dates"]["start_date"]), to: new Date(data["day_dates"]["end_date"]) }
        });



    this.weekForm.patchValue({
        weekRange: { from: new Date(data["week_dates"]["start_date"]), to: new Date(data["week_dates"]["end_date"]) }
    });

    this.monthForm.patchValue({
        monthRange: { from: new Date(data["month_dates"]["start_date"]), to: new Date(data["month_dates"]["end_date"]) }
    });

    this.yearForm.patchValue({
        yearRange: { from: new Date(data["year_dates"]["start_date"]), to: new Date(data["year_dates"]["end_date"]) }
    });

    this.intradayForm.patchValue({
        intradayRange: { from: new Date(data["intraday_dates"]["start_date"]), to: new Date(data["intraday_dates"]["end_date"]) }
    });

    this.mailStatusForm.patchValue({
        mailStatusDayRange: { from: new Date(data["mail_status_dates"]["start_date"]), to: new Date(data["mail_status_dates"]["end_date"]) }
    });


    // AUTO LOAD MAIL STATUS FOR NLDC ONLY
        if (this.hasRole(['nldc'])) {
        this.selectedOption = "mail_status";
        setTimeout(() => this.fetchForMailStatus(), 100);
    }



        this._basicHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
        this._basicWeekHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
        this._basicMonthHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
        this._basicYearHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
        this._basicIntradayHeatmapChart('["--vz-success", "--vz-danger"]');
        this._basicMailStatusHeatmapChart('["--vz-success", "--vz-danger"]');

        
        // this.dataArrived = true;

        // manually trigger change detection
        this.cd.detectChanges();


        }



   

        // if(this.userData['state_id'] != 6){}

    //     })

    // this.dashboardService.fetchDayUploadStatus().subscribe({
    //     next: (data) => {
    //         // handle data
    //     },
    //     error: (error) => {
    //         console.error("Failed to fetch data:", error);
    //     }
    });


    this.validationform = this.formBuilder.group({
        // firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // lastName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // userName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // city: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // zip: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        breakup: ['2', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],        
        monthDate: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }],
      });

           // Disable state dropdown for everyone except admin
            if (!this.hasRole(['admin'])) {
                this.validationform.get('state')?.disable();
            }

      

      this.faform = this.formBuilder.group({
        // firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // lastName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // userName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // city: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // zip: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        monthDate: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }],
      });

      this.breakupform = this.formBuilder.group({
        // firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // lastName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // userName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // city: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        // zip: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        breakup: ['2', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],        
        monthDate: [{"from": this.getPreviousMonthDates()["startDate"], "to":this.getPreviousMonthDates()["endDate"] }],
      });



        if (this.userData.role === 'f_user') {

            this.validationform.get('state')!.setValue(this.userData['state_id']);
            this.validationform.get('state')!.disable();

            this.faform.get('state')!.setValue(this.userData['state_id']);
            this.faform.get('state')!.disable();

            this.breakupform.get('state')!.setValue(this.userData['state_id']);
            this.breakupform.get('state')!.disable();
        }
        else {
            this.validationform.get('state')!.setValue(this.userData['state_id']);
            this.breakupform.get('state')!.setValue(this.userData['state_id']);
        }
    

      this.dashboardMapeComp();




    


        


          setTimeout(() => {
                // console.log("FINAL USER DATA AFTER INIT:", this.userData);

                // console.log("ADMIN CHECK:", this.hasRole(['admin']));
                // console.log("NLDC CHECK:", this.hasRole(['nldc']));
                // console.log("F_USER CHECK:", this.hasRole(['f_user']));
                }, 500);  

   
  }



  weekAhead() {
    // console.log("week ahead clicked!")
  }

  monthAhead() {
    // console.log("Month ahead clicked!")
  }

  yearAhead() {
    // console.log("Year ahead clicked!")
  }

  validSubmit() {
    this.submit = true;
  }

  afValidSubmit() {
    this.afSubmit = true;
  }

  formSubmit() {
    this.formsubmit = true;
  }

  breakupValidSubmit() {
    this.breakupsubmit = true;
  }


  get form() {
    return this.validationform.controls;
  }

  get breakupForm() {
    return this.breakupform.controls;
  }

  get afform(){
    return this.faform.controls;
  }

  areStartingAndEndingDatesOfSameMonth(fromDate:Date, toDate: Date) {
    // Calculate the first day (starting date) of the same month as toDate
    const firstDayOfMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
  
    // Calculate the last day (ending date) of the same month as fromDate
    const lastDayOfMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);
  
    return fromDate.getTime() === firstDayOfMonth.getTime() && toDate.getTime() === lastDayOfMonth.getTime();
  }
    
  
  daysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months in JavaScript are 0-indexed
  
    // Use Date.UTC to avoid time zone issues
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0));
    return lastDayOfMonth.getUTCDate();
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




  // generateStatusData() {
  //   return this.http
  // }


  private _basicHeatmapChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.basicHeatmapChart = {
        series: this.day_data || [],
        chart: {
            height: 300,
            width: '100%',    
            type: 'heatmap',
            offsetX: 0,
            offsetY: -8,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 20,
            markers: {
                width: 20,
                height: 6,
                radius: 2,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 0
            },
        },
        colors: colors,
        plotOptions: {
            heatmap: {
                colorScale: {
                    ranges: [{
                        from: 0,
                        to: 0,
                        name: 'Late Upload',
                        color: colors[2]
                    },
                    {
                        from: 2,
                        to: 2,
                        name: 'Not Uploaded',
                        color: colors[1]
                    },
                    {
                        from: 1,
                        to: 1,
                        name: 'Uploaded',
                        color: colors[0]
                    },
                    ]
                }
            }
        },
        tooltip: {
            
            custom: function(opts: any) {
                // if (w && w.config && w.config.series && w.config.series[seriesIndex] && w.config.series[seriesIndex].data && w.config.series[seriesIndex].data[dataPointIndex]) {
                    const uploadTime =  opts.ctx.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].upload_time;
                    // const uploadTime = w.config.series[seriesIndex].data[dataPointIndex].upload_time;
                    if (uploadTime) {
                        return '<b>Upload Time: </b> ' + uploadTime ;
                            
                            
                    }
                   
    
                    
                // }

                else {
                    return "<b>Not Uploaded</b>" 
                }
                
                   
            }
        }

    
    };


}


private _basicWeekHeatmapChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.basicWeekHeatmapChart = {
        series: this.week_data || [],
        chart: {
            height: 300,
            width: '90%',
            type: 'heatmap',
            offsetX: 0,
            offsetY: -8,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 20,
            markers: {
                width: 20,
                height: 6,
                radius: 2,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 0
            },
        },
        colors: colors,
        
        plotOptions: {
            heatmap: {
                
                colorScale: {
                    ranges: [{
                        from: 0,
                        to: 0,
                        name: 'Late Upload',
                        color: colors[2]
                    },
                    {
                        from: 2,
                        to: 2,
                        name: 'Not Uploaded',
                        color: colors[1]
                    },
                    {
                        from: 1,
                        to: 1,
                        name: 'Uploaded',
                        color: colors[0]
                    },
                    ]
                }
            }
        },
        tooltip: {
            
            custom: function(opts: any) {
                // if (w && w.config && w.config.series && w.config.series[seriesIndex] && w.config.series[seriesIndex].data && w.config.series[seriesIndex].data[dataPointIndex]) {
                    const uploadTime =  opts.ctx.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].upload_time;
                    // const uploadTime = w.config.series[seriesIndex].data[dataPointIndex].upload_time;
                    if (uploadTime) {
                        return '<b>Upload Time: </b> ' + uploadTime ;
                            
                            
                    }
                   
    
                    
                // }

                else {
                    return "<b>Not Uploaded</b>" ;
                }
                
                    
            }
        }
    };
}




private _basicMonthHeatmapChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.basicMonthHeatmapChart = {
        series: this.month_data || [],
        xaxis: {
            type: 'datetime'
          },  
        chart: {
            height: 300,
            width: '100%',
            type: 'heatmap',
            offsetX: 0,
            offsetY: -8,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 20,
            markers: {
                width: 20,
                height: 6,
                radius: 2,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 0
            },
        },
        colors: colors,
        
        plotOptions: {
            heatmap: {
                
                colorScale: {
                    ranges: [{
                        from: 0,
                        to: 0,
                        name: 'Late Upload',
                        color: colors[2]
                    },
                    {
                        from: 2,
                        to: 2,
                        name: 'Not Uploaded',
                        color: colors[1]
                    },
                    {
                        from: 1,
                        to: 1,
                        name: 'Uploaded',
                        color: colors[0]
                    },
                    ]
                }
            }
        },
        tooltip: {
            
            custom: function(opts: any) {
                // if (w && w.config && w.config.series && w.config.series[seriesIndex] && w.config.series[seriesIndex].data && w.config.series[seriesIndex].data[dataPointIndex]) {
                    const uploadTime =  opts.ctx.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].upload_time;
                    // const uploadTime = w.config.series[seriesIndex].data[dataPointIndex].upload_time;
                    if (uploadTime) {
                        return '<b>Upload Time: </b> ' + uploadTime ;
                            
                            
                    }
                   
    
                    
                // }

                else {
                    return "<b>Not Uploaded</b>" ;
                }
                
                    
            }
        }
    };
}

private _basicYearHeatmapChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.basicYearHeatmapChart = {
        series: this.year_data || [],
        xaxis: {
            type: 'datetime'
          },  
        chart: {
            height: 300,
            width: '100%',
            type: 'heatmap',
            offsetX: 0,
            offsetY: -8,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 20,
            markers: {
                width: 20,
                height: 6,
                radius: 2,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 0
            },
        },
        colors: colors,
        
        plotOptions: {
            heatmap: {
                
                colorScale: {
                    ranges: [{
                        from: 0,
                        to: 0,
                        name: 'Late Upload',
                        color: colors[2]
                    },
                    {
                        from: 2,
                        to: 2,
                        name: 'Not Uploaded',
                        color: colors[1]
                    },
                    {
                        from: 1,
                        to: 1,
                        name: 'Uploaded',
                        color: colors[0]
                    },
                    ]
                }
            }
        },
        tooltip: {
            
            custom: function(opts: any) {
                // if (w && w.config && w.config.series && w.config.series[seriesIndex] && w.config.series[seriesIndex].data && w.config.series[seriesIndex].data[dataPointIndex]) {
                    const uploadTime =  opts.ctx.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].upload_time;
                    // const uploadTime = w.config.series[seriesIndex].data[dataPointIndex].upload_time;
                    if (uploadTime) {
                        return '<b>Upload Time: </b> ' + uploadTime ;
                            
                            
                    }
                   
    
                    
                // }

                else {
                    return "<b>Not Uploaded</b>" ;
                }
                
                    
            }
        }
    };
}


private _basicIntradayHeatmapChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.basicIntradayHeatmapChart = {
        series: this.intraday_data || [],
        xaxis: {
            type: 'datetime'
          },  
        chart: {
            height: 300,
            width: '100%',
            type: 'heatmap',
            offsetX: 0,
            offsetY: -8,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 20,
            markers: {
                width: 20,
                height: 6,
                radius: 2,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 0
            },
        },
        colors: colors,
        
        plotOptions: {
            heatmap: {
                
                colorScale: {
                    ranges: [
                    {
                        from: 0,
                        to: 0,
                        name: 'Not Uploaded',
                        color: colors[1]
                    },
                    {
                        from: 1,
                        to: 1,
                        name: 'Uploaded',
                        color: colors[0]
                    },
                    ]
                }
            }
        },
        tooltip: {
            
            custom: function(opts: any) {
                // if (w && w.config && w.config.series && w.config.series[seriesIndex] && w.config.series[seriesIndex].data && w.config.series[seriesIndex].data[dataPointIndex]) {
                    const uploadStatus =  opts.ctx.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].y;
                    // const uploadTime = w.config.series[seriesIndex].data[dataPointIndex].upload_time;
                    if (uploadStatus==0) {
                        return '<b>Not Uploaded</b>' ;
                            
                            
                    }
                   
    
                    
                // }

                else {
                    return "<b>Uploaded</b>" ;
                }
                
                    
            }
        }
    };
}

private _basicMailStatusHeatmapChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.basicMailStatusHeatmapChart = {
        series: this.mail_status_data || [],
        xaxis: {
            type: 'datetime'
          },  
        chart: {
            height: 300,
            width: '100%',
            type: 'heatmap',
            offsetX: 0,
            offsetY: -8,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 20,
            markers: {
                width: 20,
                height: 6,
                radius: 2,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 0
            },
        },
        colors: colors,
        
        plotOptions: {
            heatmap: {
                
                colorScale: {
                    ranges: [
                    {
                        from: 0,
                        to: 0,
                        name: 'Not Sent',
                        color: colors[1]
                    },
                    {
                        from: 1,
                        to: 1,
                        name: 'Sent',
                        color: colors[0]
                    },
                    ]
                }
            }
        },
        tooltip: {
            
            custom: function(opts: any) {
                // if (w && w.config && w.config.series && w.config.series[seriesIndex] && w.config.series[seriesIndex].data && w.config.series[seriesIndex].data[dataPointIndex]) {
                    const uploadStatus =  opts.ctx.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].y;
                    // const uploadTime = w.config.series[seriesIndex].data[dataPointIndex].upload_time;
                    if (uploadStatus==0) {
                        return '<b>Not Sent</b>' ;
                            
                            
                    }
                   
    
                    
                // }

                else {
                    return "<b>Sent</b>" ;
                }
                
                    
            }
        }
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


getLast30DaysDates() {
    // Get the current date
    const currentDate = new Date();

    // Calculate the start date, which is 30 days before today
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - 29); // 29 days before today (inclusive of today)

    // Format the dates as strings (in "YYYY-MM-DD" format)
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = currentDate.toISOString().split('T')[0];

    return {
        startDate: startDateString,
        endDate: endDateString
    };
}



    fetchForDay() {

        
        const formData = {
            // state: this.validationform.get('state')!.value,
            fromDate: this.dayForm.get('dayRange')?.value["from"].toLocaleDateString('en-GB'),
            toDate: this.dayForm.get('dayRange')?.value["to"].toLocaleDateString('en-GB')
          };

          this.loading = true


          this.dashboardService.fetchDayRangeStatus(formData).subscribe((data: any) => {
            this.loading = false;

            //   console.log(data);
            //   console.log("API Hit and Response receieved")
              this.day_data = data["day"];
            //   this.week_data = data["week"];
            //   this.month_data = data["month"];
              this._basicHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
            //   this._basicWeekHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
            //   this._basicMonthHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
              
            //   this.dataArrived = true;

            // manually trigger change detection
                this.cd.detectChanges();
        
            })


            
    }

    fetchForWeek() {

        const formData = {
            // state: this.validationform.get('state')!.value,
            fromDate: this.weekForm.get('weekRange')?.value["from"].toLocaleDateString('en-GB'),
            toDate: this.weekForm.get('weekRange')?.value["to"].toLocaleDateString('en-GB')
          };

          this.weekloading = true;
          

          this.dashboardService.fetchWeekRangeStatus(formData).subscribe((data: any) => {
                this.weekloading = false;
            //   console.log(data);
            //   console.log("API Hit and Response receieved")
            //   this.day_data = data["day"];
              this.week_data = data["week"];
            //   this.month_data = data["month"];
            //   this._basicHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
              this._basicWeekHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
            //   this._basicMonthHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
              
            //   this.dataArrived = true;

            // manually trigger change detection
            this.cd.detectChanges();
        
            })

    }

    fetchForMonth() {

        this.monthloading = true;

        const formData = {
            // state: this.validationform.get('state')!.value,
            fromDate: this.monthForm.get('monthRange')?.value["from"].toLocaleDateString('en-GB'),
            toDate: this.monthForm.get('monthRange')?.value["to"].toLocaleDateString('en-GB')
          };

          this.dashboardService.fetchMonthRangeStatus(formData).subscribe((data: any) => {
                this.monthloading = false;
            //   console.log(data);
            //   console.log("API Hit and Response receieved")
            //   this.day_data = data["day"];
            //   this.week_data = data["week"];
              this.month_data = data["month"];
            //   this._basicHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
            //   this._basicWeekHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
              this._basicMonthHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
              
            //   this.dataArrived = true;
            // manually trigger change detection
            this.cd.detectChanges();
        
            })

    }


    dashboardMapeComp() {
        const formData = {
            state: this.validationform.get('state')!.value,
            fromDate: this.validationform.get('monthDate')?.value["from"].toLocaleDateString('en-GB'),
            toDate: this.validationform.get('monthDate')?.value["to"].toLocaleDateString('en-GB')
          };

        this.dashboardService.mapeChart(formData).subscribe((res: any) => {
            this.mapeloading = false;
            if(res["status"] == "failure") {
                this.MarketplaceChart.series = [];
                this.mape_title = res["title"];
            }

            else {
                // console.log("Data Received!") 
                // console.log(res);

                 // 🔹 STORE RAW DATA FOR CSV
                this.mapeRawSeries = res.data;
                this.comparisonRawSeries = res.comp_data.data;

                this.MarketplaceChart.series = res["data"];

                // Build ECharts MAPE chart
                this.buildEchartsMape(res["data"]);

                
                this.mape_title = res["title"];
                // console.log(this.MarketplaceChart.series);
                // console.log(this.MarketplaceChart.title)


                this.MarketplaceChartAF.series = res["comp_data"]["data"]
                this.buildEchartsComparison(res["comp_data"]["data"]);

                this.fa_compare_title = res["comp_data"]["title"];

                // manually trigger change detection
            


            }

            // manually trigger change detection
            this.cd.detectChanges();
        })
    }

    


    confirm() {
        
        
            // console.log()
            if(this.validationform.valid) {
                // const formData = new FormData();
                this.mapeloading = true;
                const formData = {
                    state: this.validationform.get('state')!.value,
                    fromDate: this.validationform.get('monthDate')?.value["from"].toLocaleDateString('en-GB'),
                    toDate: this.validationform.get('monthDate')?.value["to"].toLocaleDateString('en-GB'),
                    indexNumber: this.validationform.get('breakup')?.value
                  };

                // this.dashboardService.mapeChart(formData).subscribe((res: any) => {
                    this.dashboardService.breakupActualForecast(formData).subscribe((res: any) => {
                    this.mapeloading = false;
                    if(res["status"] == "failure") {
                        this.MarketplaceChart.series = [];
                        this.mape_title = res["title"];
                    }

                    else {
                        // console.log("Data Received!") 
                        // console.log(res);

                                this.mapeRawSeries = res.data;
                                this.comparisonRawSeries = res.comp_data.data;

                        this.MarketplaceChart.series = res["data"];

                        // Build ECharts MAPE chart
                        this.buildEchartsMape(res["data"]);

                        this.mape_title = res["title"];
                        // console.log(this.MarketplaceChart.series);
                        // console.log(this.MarketplaceChart.title)


                        this.MarketplaceChartAF.series = res["comp_data"]["data"]
                        this.buildEchartsComparison(res["comp_data"]["data"]);

                        this.fa_compare_title = res["comp_data"]["title"];
 

                    }

                    // manually trigger change detection
                    this.cd.detectChanges();
                })
             }
        
    }

    afConfirm() {
        
        
        // console.log()
        if(this.faform.valid) {
            // const formData = new FormData();
            this.afloading = true;
            const formData = {
                state: this.faform.get('state')!.value,
                fromDate: this.faform.get('monthDate')?.value["from"].toLocaleDateString('en-GB'),
                toDate: this.faform.get('monthDate')?.value["to"].toLocaleDateString('en-GB')
              };

            this.dashboardService.actualForecastComp(formData).subscribe((res: any) => {
                this.afloading = false;
                if(res["status"] == "failure") {
                    this.MarketplaceChartAF.series = [];
                    this.fa_compare_title = res["title"];
                }

                else {
                    // console.log("Data Received!") 
                    // console.log(res);

                    this.MarketplaceChartAF.series = res["data"];
                    this.buildEchartsComparison(res["data"]);

                    this.fa_compare_title = res["title"];
                    // console.log(this.MarketplaceChart.series);
                    // console.log(this.MarketplaceChart.title)

                    if("message" in res) {
                        this.toastService.show(res["message"], { classname: 'bg-success text-white', delay: 3000 });

                    }


                }

                // manually trigger change detection
                this.cd.detectChanges();
            })
         }
    
        }

        breakupConfirm() {
        
        
            // console.log()
            if(this.breakupform.valid) {
                // const formData = new FormData();
                this.breakuploading = true;
                const formData = {
                    state: this.breakupform.get('state')!.value,
                    fromDate: this.breakupform.get('monthDate')?.value["from"].toLocaleDateString('en-GB'),
                    toDate: this.breakupform.get('monthDate')?.value["to"].toLocaleDateString('en-GB'),
                    indexNumber: this.breakupform.get('breakup')?.value
                  };

                  this.dashboardService.breakupParameters(formData).subscribe((res: any) => {
                    this.breakuploading = false;
                
                    if (res["status"] === "failure") {
                        console.error("Failed to fetch data");
                    } else {
                        console.log(" Received MAPE API Data:", res.MAPE?.data);
                
                        // const mapeSeriesRaw = res.MAPE?.data || [];
                
                        // this.multiaxis_data = mapeSeriesRaw.map((series: { name: string, type: string, data: any[] }) => ({
                        //     name: series.name,
                        //     // type: series.type,
                        //     data: series.data.map((point: any) => ({
                        //         x: point.x,  // Keep date string as-is
                        //         y: point.y !== null && point.y !== "" ? Number(point.y) : null
                        //     }))
                        // }));
            
                        this.multiaxis_data = res["data"]
                
                        // console.log(" Processed MAPE Chart Data:", this.multiaxis_data);
                
                        setTimeout(() => {
                            // this._multiAxisForecastChart('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info", "--vz-secondary", "--vz-dark"]');
                            this._multiAxisForecastChart('["--vz-primary", "--vz-success", "--vz-warning"]');
                        }, 50);
                    }
                    // manually trigger change detection
                    this.cd.detectChanges();
                });
             }
        
    }


    fetchForYear() {

        this.yearloading = true;

        const formData = {
            // state: this.validationform.get('state')!.value,
            fromDate: this.yearForm.get('yearRange')?.value["from"].toLocaleDateString('en-GB'),
            toDate: this.yearForm.get('yearRange')?.value["to"].toLocaleDateString('en-GB')
          };

          this.dashboardService.fetchYearRangeStatus(formData).subscribe((data: any) => {
                this.yearloading = false;
            //   console.log(data);
            //   console.log("API Hit and Response receieved")
            //   this.day_data = data["day"];
            //   this.week_data = data["week"];
              this.year_data = data["year"];
            //   this._basicHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
            //   this._basicWeekHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
              this._basicYearHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
              
            //   this.dataArrived = true;

            // manually trigger change detection
            this.cd.detectChanges();
        
            })

    }

    fetchForIntraday() {

        this.intradayLoading = true;

        const formData = {
            // state: this.validationform.get('state')!.value,
            fromDate: this.intradayForm.get('intradayRange')?.value["from"].toLocaleDateString('en-GB'),
            toDate: this.intradayForm.get('intradayRange')?.value["to"].toLocaleDateString('en-GB')
          };

          this.dashboardService.fetchIntradayRangeStatus(formData).subscribe((data: any) => {
                this.intradayLoading = false;
            //   console.log(data);
            //   console.log("API Hit and Response receieved")
            //   this.day_data = data["day"];
            //   this.week_data = data["week"];
              this.intraday_data = data["intraday"];
            //   this._basicHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
            //   this._basicWeekHeatmapChart('["--vz-success", "--vz-danger", "--vz-warning"]');
              this._basicIntradayHeatmapChart('["--vz-success", "--vz-danger"]');
              
            //   this.dataArrived = true;
            // manually trigger change detection
            this.cd.detectChanges();
        
            })

    }


     fetchForMailStatus() {

        this.mailStatusLoading = true;

        const formData = {
            // state: this.validationform.get('state')!.value,
            fromDate: this.mailStatusForm.get('mailStatusDayRange')?.value["from"].toLocaleDateString('en-GB'),
            toDate: this.mailStatusForm.get('mailStatusDayRange')?.value["to"].toLocaleDateString('en-GB')
          };

          this.dashboardService.fetchMailStatusRangeStatus(formData).subscribe((data: any) => {
                this.mailStatusLoading = false;
            //   console.log(data);
            //   console.log("API Hit and Response receieved")
            //   this.day_data = data["day"];
            //   this.week_data = data["week"];
             this.mail_status_data = [...data["mail_status"]];  // new array reference

            // recreate chart completely
            this.basicMailStatusHeatmapChart = null;
            setTimeout(() => {
                this._basicMailStatusHeatmapChart('["--vz-success", "--vz-danger"]');
                this.cd.detectChanges();
            }, 50);
        
            })

    }






    private _marketplaceChart(colors: any) {
        colors = this.getChartColorsArray(colors);
        this.MarketplaceChart = {
            series:this.mape_data || [],
            xaxis: {
                type: 'datetime'
              },  
              yaxis: {
                labels: {
                    show: true,
                    formatter: function (y: number) {
                        
                        return y + "%";
                    },
                    style: {
                        colors: '#333', // Adjust y-axis label color as needed
                        fontSize: '12px' // Adjust the label font size
                    }
                },
                
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



    private _actualForecastmarketplaceChart(colors: any) {
        colors = this.getChartColorsArray(colors);
        
        this.MarketplaceChartAF = {
            series: this.demand_data || [],  // Ensure timestamps are in UTC in your demand_data
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
                            return "No Data";
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
    



    // private _multiAxisForecastChart(colors: any) {
    //     colors = this.getChartColorsArray(colors);
    
    //     this.multiAxisForecastChart = {
    //         series: this.multiaxis_data.length > 0 ? this.multiaxis_data : [], //  Ensure series is not empty
    //         chart: { height: 350, type: 'line', stacked: false, zoom: { enabled: true } },
    //         stroke: { width: [0, 2, 2, 2, 2, 2, 2] },
    //         xaxis: { type: 'datetime' },
    //         yaxis: [
    //             {
    //                 seriesName: 'MAPE',
    //                 axisTicks: { show: true },
    //                 axisBorder: { show: true, color: '#ff0000' },
    //                 labels: { 
    //                     style: { colors: '#ff0000' }, //  Ensures MAPE labels are colored properly
    //                     formatter: (y: number | null) => (y !== null ? `${y.toFixed(1)}%` : null) //  Handle null values correctly
    //                 },
    //                 title: {
    //                     text: "MAPE (%)",
    //                     style: { color: '#ff0000', fontWeight: 600 }
    //                 }
    //             },
    //             {
    //                 seriesName: 'Forecast & Actual',
    //                 opposite: true,
    //                 axisTicks: { show: true },
    //                 axisBorder: { show: true, color: '#405189' },
    //                 labels: { 
    //                     style: { colors: '#405189' }, //  Ensures MW labels are colored properly
    //                     formatter: (y: number | null) => (y !== null ? `${y} MW` : null) //  Handle null values correctly
    //                 },
    //                 title: {
    //                     text: "Forecast & Actual (MW)",
    //                     style: { color: '#405189', fontWeight: 600 }
    //                 }
    //             }
    //         ],
    //         tooltip: { shared: true, x: { format: 'dd MMM HH:mm' } },
    //         colors: colors
    //     };
    
    //     // console.log("Updated Chart Config:", this.multiAxisForecastChart);

       
    // }


    private _multiAxisForecastChart(colors: any) {
        colors = this.getChartColorsArray(colors);
    
        const alignToMidnight = (x: any) => {
            const d = new Date(x);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        };
    
        const processedData = this.multiaxis_data.map((series: any) => {
            const isMape = series.name.toLowerCase().includes('mape');
    
            return {
                ...series,
                type: isMape ? 'column' : 'line',
                yAxis: isMape ? 0 : 1,
                data: series.data.map((d: any) => ({
                    x: isMape ? alignToMidnight(d.x) : new Date(d.x).getTime(),
                    y: d.y
                }))
            };
        });
    
        this.multiAxisForecastChart = {
            series: processedData || [], // Ensure series is not empty
            chart: {
                height: 400,
                type: 'line',
                stacked: false,
                zoom: { enabled: true },
                animations: { enabled: false },
                toolbar: { show: true }
            },
            stroke: {
                width: processedData.map((s: any) => s.type === 'line' ? 2 : 0),
                curve: 'smooth'
            },
            plotOptions: {
                bar: {
                    columnWidth: '150%', // Wider bar width
                    distributed: false,
                    borderRadius: 2
                }
            },
            xaxis: {
                type: 'datetime',
                tickAmount: 12,
                labels: {
                    rotate: -45,
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: "MMM 'yy",
                        day: 'dd MMM',
                        hour: 'HH:mm'
                    }
                },
                title: { text: 'Timestamp' }
            },
            yaxis: [
                {
                    title: {
                        text: 'MAPE (%)',
                        style: { color: '#E91E63' }
                    },
                    labels: {
                        formatter: (val: number) => `${val.toFixed(1)}%`,
                        style: { color: '#E91E63' }
                    },
                    min: 0,
                    max: 100,
                    opposite: false
                },
                {
                    title: {
                        text: 'Demand (MW)',
                        style: { color: '#008000' }
                    },
                    labels: {
                        formatter: (val: number) => `${Math.round(val)}`,
                        style: { color: '#008000' }
                    },
                    min: 0,
                    forceNiceScale: true,
                    opposite: true
                }
            ],
            tooltip: {
                shared: true,
                x: {
                    format: 'dd MMM yyyy, HH:mm'
                },
                y: {
                    formatter: (val: number, opts: any) => {
                        const name = opts.series[opts.seriesIndex].name.toLowerCase();
                        return name.includes('mape') ? `${val.toFixed(1)}%` : `${Math.round(val)} MW`;
                    }
                }
            },
            colors: colors,
            legend: {
                show: true,
                position: 'bottom'
            }
        };
    }
    

    // Utility function to format dates to 'YYYY-MM-DD'

    


    formatDateToYYYYMMDD(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onBreakupChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
  
    const formData = {
        state: this.validationform.get('state')!.value,
        fromDate: this.validationform.get('monthDate')?.value["from"].toLocaleDateString('en-GB'),
        toDate: this.validationform.get('monthDate')?.value["to"].toLocaleDateString('en-GB'),
        indexNumber: selectedValue
    };






    this.dashboardService.breakupParameters(formData).subscribe((res: any) => {
        this.breakuploading = false;
    
        if (res["status"] === "failure") {
            console.error("Failed to fetch data");
        } else {
            console.log(" Received MAPE API Data:", res.MAPE?.data);
    
            // const mapeSeriesRaw = res.MAPE?.data || [];
    
            // this.multiaxis_data = mapeSeriesRaw.map((series: { name: string, type: string, data: any[] }) => ({
            //     name: series.name,
            //     // type: series.type,
            //     data: series.data.map((point: any) => ({
            //         x: point.x,  // Keep date string as-is
            //         y: point.y !== null && point.y !== "" ? Number(point.y) : null
            //     }))
            // }));

            this.multiaxis_data = res["data"]
    
            console.log(" Processed MAPE Chart Data:", this.multiaxis_data);
    
            setTimeout(() => {
                // this._multiAxisForecastChart('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info", "--vz-secondary", "--vz-dark"]');
                this._multiAxisForecastChart('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]');
            }, 50);
        }
            // manually trigger change detection
            this.cd.detectChanges();
    });
}

    // hasRole(roles: string[]): boolean {
    // if (!this.userData) return false;
    // return roles.map(r => r.toLowerCase()).includes(this.userData.role.toLowerCase());
    // }

    hasRole(roles: string[]): boolean {

    // console.log("========== hasRole() DEBUG ==========");
    // console.log("Roles Expected By UI:", roles);
    // console.log("User Data from TokenStorage:", this.userData);

    if (!this.userData) {
        console.error(" userData is NULL");
        return false;
    }

    if (!this.userData.role) {
        // console.error(" userData.role is MISSING");
        return false;
    }

    const userRole = this.userData.role.toLowerCase().trim();
    const allowedRoles = roles.map(r => r.toLowerCase().trim());

    // console.log(" User Role:", userRole);
    // console.log(" Allowed Roles:", allowedRoles);

    const result = allowedRoles.includes(userRole);

    // console.log(" hasRole RESULT:", result);
    // console.log("=====================================");

    return result;
    }

buildEchartsComparison(seriesData: any[]) {

    // Extract all Y values except null or 0
    const allValues = seriesData
        .flatMap(s => s.data.map((d: any) => d.y))
        .filter((v: any) => v !== null && v !== 0);

    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    // Add padding to Y-axis
    const yMin = minVal - 500;
    const yMax = maxVal + 500;

    this.comparisonEchartOptions = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: function (params: any) {
                let result = params[0].axisValueLabel + '<br/>';
                params.forEach((p: any) => {
                    const val = (p.data[1] === null ? 'No Data' : p.data[1] + ' MW');
                    result += p.marker + p.seriesName + ': ' + val + '<br/>';
                });
                return result;
            }
        },

        legend: {
            data: seriesData.map((s: any) => s.name),
            top: 10
        },

        xAxis: {
            type: 'time',
            boundaryGap: false,

            // ★★★ FIX OVERLAPPING LABELS ★★★
            axisLabel: {
                rotate: 35,
                margin: 15,
                formatter: (value: any) => {
                    return new Date(value).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            },

            // show fewer ticks
            splitNumber: 8
        },

        yAxis: {
            type: 'value',
            min: yMin,
            max: yMax,
            axisLabel: {
                formatter: '{value} MW'
            }
        },

        // ★★★ Allow zooming horizontally ★★★
        dataZoom: [
            {
                type: 'slider',
                start: 0,
                end: 100,
                height: 18
            },
            { type: 'inside' }
        ],

        series: seriesData.map((s: any) => ({
            name: s.name,
            type: 'line',
            smooth: true,
            showSymbol: false,
            symbol: 'circle',

            data: s.data.map((d: any) => [
                d.x,
                d.y === 0 ? null : d.y      // remove 0 dips
            ])
        }))
    };
}

buildEchartsMape(seriesData: any[]) {

    if (!seriesData || seriesData.length === 0) {
        this.mapeEchartOptions = {};
        return;
    }

    // Extract all valid y-values from all series
    const allValues = seriesData
        .flatMap(s => s.data.map((d: any) => d.y))
        .filter((v: any) => v !== null);

    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    const yMin = Math.max(0, minVal - 5);
    const yMax = maxVal + 5;

    this.mapeEchartOptions = {
        tooltip: {
            trigger: 'axis',
            formatter: function (params: any) {
                let result = params[0].axisValueLabel + "<br/>";
                params.forEach((p: any) => {
                    result += `${p.marker}${p.seriesName}: ${
                        p.data[1] !== null ? p.data[1].toFixed(2) + "%" : "No Data"
                    }<br/>`;
                });
                return result;
            }
        },

        legend: {
            data: seriesData.map(s => s.name),
            top: 10
        },

        xAxis: {
            type: 'time',
            boundaryGap: false,
            axisLabel: {
                rotate: 35,
                formatter: (value: any) => {
                    return new Date(value).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                    });
                }
            },
            splitNumber: 10
        },

        yAxis: {
            type: 'value',
            min: yMin,
            max: yMax,
            axisLabel: { formatter: '{value} %' }
        },

        dataZoom: [
            { type: 'slider', height: 18, start: 0, end: 100 },
            { type: 'inside' }
        ],

        series: seriesData.map((serie: any) => ({
            name: serie.name,
            type: 'line',
            smooth: true,
            showSymbol: false,
            symbol: 'circle',
            lineStyle: { width: 2 },

            data: serie.data.map((d: any) => [
                d.x,
                d.y === null ? null : Number(d.y)
            ])
        }))
    };
}


onComparisonChartInit(ec: any) {
  this.comparisonChartInstance = ec;
}

onMapeChartInit(ec: any) {
  this.mapeChartInstance = ec;
}

ngAfterViewInit() {
  window.addEventListener("resize", () => {
    this.comparisonChartInstance?.resize();
    this.mapeChartInstance?.resize();
  });
}

// ===============================
// CSV DOWNLOAD – GENERIC HELPER
// ===============================
downloadCSV(filename: string, headers: string[], rows: any[][]) {
    const csvContent =
        [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
}


downloadMapeCSV() {

    if (!this.mapeRawSeries.length) return;

    const headers = ['Date', ...this.mapeRawSeries.map(s => s.name)];

    const dateSet = new Set<string>();
    this.mapeRawSeries.forEach(s =>
        s.data.forEach((d: any) => dateSet.add(d.x))
    );

    const dates = Array.from(dateSet).sort();

    const rows = dates.map(date => {
        const row = [date];
        this.mapeRawSeries.forEach(s => {
            const point = s.data.find((d: any) => d.x === date);
            row.push(point ? point.y : '');
        });
        return row;
    });

    const fromDate = dates[0];
    const toDate = dates[dates.length - 1];

    this.downloadCSV(
        `MAPE_${this.validationform.get('state')?.value}_${fromDate}_${toDate}.csv`,
        headers,
        rows
    );
}



downloadComparisonCSV() {

    if (!this.comparisonRawSeries.length) return;

    const headers = ['DateTime', ...this.comparisonRawSeries.map(s => s.name)];

    const dateSet = new Set<string>();
    this.comparisonRawSeries.forEach(s =>
        s.data.forEach((d: any) => dateSet.add(d.x))
    );

    const dates = Array.from(dateSet).sort();

    const rows = dates.map(date => {
        const row = [date];
        this.comparisonRawSeries.forEach(s => {
            const point = s.data.find((d: any) => d.x === date);
            row.push(point ? point.y : '');
        });
        return row;
    });

    const fromDate = dates[0];
    const toDate = dates[dates.length - 1];

    this.downloadCSV(
        `Comparison_${this.validationform.get('state')?.value}_${fromDate}_${toDate}.csv`,
        headers,
        rows
    );
}




  
}



