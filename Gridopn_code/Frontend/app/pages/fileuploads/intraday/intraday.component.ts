import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/core/services/toast-service';
import Swal from 'sweetalert2';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import * as jspreadsheet from 'jspreadsheet-ce';
import { DatePipe } from '@angular/common';
import { IntradayForecastService } from 'src/app/core/services/intraday-forecast.service';

const today = new Date();

@Component({
  selector: 'app-intraday',
  templateUrl: './intraday.component.html',
  styleUrls: ['./intraday.component.scss']
})

export class IntradayComponent {

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

  state_id_dict: any = { 'kar_state': 1, 'tn_state': 2, 'tg_state': 3, 'ap_state': 4, 'ker_state': 5, 'pondy_state': 7 }

  @ViewChild('editmodalShow') editmodalShow!: TemplateRef<any>;
  @ViewChild('modalShow') modalShow !: TemplateRef<any>;
  @ViewChild("spreadsheet", { static: true }) spreadsheet !: ElementRef<any>;

  constructor(
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    public toastService: ToastService,
    private TokenStorageService: TokenStorageService,
    private intradayForecast: IntradayForecastService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    this.breadCrumbItems = [
      { label: 'File Uploads' },
      { label: 'Day Ahead Forecast', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    this.validationform = this.formBuilder.group({
      state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      disabledDate: [null],
      excelFile: [null]
    });

    this.fetchAndSetDate();


    if (this.userData?.role === 'f_user') {
      const st = this.userData.state_id;
      this.validationform.get('state')!.setValue(st);   // auto-fill state
      this.validationform.get('state')!.disable();      // lock state dropdown
      this.validationform.get('disabledDate')!.disable();
    }

    if (!this.hasRole(['admin'])) {
      this.validationform.get('state')?.disable();
    }

    this.toastService.show('Please upload the file to preview the data and then insert!', { classname: 'bg-info text-white', delay: 5000 });
  }

  fetchAndSetDate() {
        this.intradayForecast.fetchIntradayDate({}).subscribe({
      next: (res) => {
        if (res?.day_ahead) {
          this.validationform.patchValue({
            disabledDate: res.intraday
          });
        }
      },
      error: (err) => {
        console.error('Error fetching day ahead date:', err);
      }
    });
  }


  data = [
    [1, '00:00 - 00:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, '00:15 - 00:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, '00:30 - 00:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, '00:45 - 01:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [5, '01:00 - 01:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [6, '01:15 - 01:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [7, '01:30 - 01:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [8, '01:45 - 02:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [9, '02:00 - 02:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [10, '02:15 - 02:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [11, '02:30 - 02:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [12, '02:45 - 03:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [13, '03:00 - 03:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [14, '03:15 - 03:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [15, '03:30 - 03:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [16, '03:45 - 04:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [17, '04:00 - 04:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [18, '04:15 - 04:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [19, '04:30 - 04:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [20, '04:45 - 05:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [21, '05:00 - 05:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [22, '05:15 - 05:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [23, '05:30 - 05:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [24, '05:45 - 06:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [25, '06:00 - 06:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [26, '06:15 - 06:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [27, '06:30 - 06:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [28, '06:45 - 07:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [29, '07:00 - 07:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [30, '07:15 - 07:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [31, '07:30 - 07:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [32, '07:45 - 08:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [33, '08:00 - 08:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [34, '08:15 - 08:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [35, '08:30 - 08:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [36, '08:45 - 09:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [37, '09:00 - 09:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [38, '09:15 - 09:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [39, '09:30 - 09:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [40, '09:45 - 10:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [41, '10:00 - 10:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [42, '10:15 - 10:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [43, '10:30 - 10:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [44, '10:45 - 11:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [45, '11:00 - 11:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [46, '11:15 - 11:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [47, '11:30 - 11:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [48, '11:45 - 12:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [49, '12:00 - 12:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [50, '12:15 - 12:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [51, '12:30 - 12:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [52, '12:45 - 13:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [53, '13:00 - 13:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [54, '13:15 - 13:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [55, '13:30 - 13:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [56, '13:45 - 14:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [57, '14:00 - 14:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [58, '14:15 - 14:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [59, '14:30 - 14:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [60, '14:45 - 15:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [61, '15:00 - 15:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [62, '15:15 - 15:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [63, '15:30 - 15:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [64, '15:45 - 16:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [65, '16:00 - 16:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [66, '16:15 - 16:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [67, '16:30 - 16:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [68, '16:45 - 17:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [69, '17:00 - 17:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [70, '17:15 - 17:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [71, '17:30 - 17:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [72, '17:45 - 18:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [73, '18:00 - 18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [74, '18:15 - 18:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [75, '18:30 - 18:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [76, '18:45 - 19:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [77, '19:00 - 19:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [78, '19:15 - 19:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [79, '19:30 - 19:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [80, '19:45 - 20:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [81, '20:00 - 20:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [82, '20:15 - 20:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [83, '20:30 - 20:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [84, '20:45 - 21:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [85, '21:00 - 21:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [86, '21:15 - 21:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [87, '21:30 - 21:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [88, '21:45 - 22:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [89, '22:00 - 22:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [90, '22:15 - 22:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [91, '22:30 - 22:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [92, '22:45 - 23:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [93, '23:00 - 23:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [94, '23:15 - 23:30', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [95, '23:30 - 23:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [96, '23:45 - 00:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  ];

  tempData: any = [];


  validSubmit() {
    this.submit = true;
  }

  get form() {
    return this.validationform.controls;
  }


  ngAfterViewInit() {
    jspreadsheet(this.spreadsheet.nativeElement, {
      // data: this.data,
      // freezeColumns: 2,
      footers: [[' ', 'Total MUs', '=ROUND(SUM(C1:C96)/4000,2)', '=ROUND(SUM(D1:D96)/4000,2)', '=ROUND(SUM(E1:E96)/4000,2)', '=ROUND(SUM(F1:F96)/4000,2)', '=ROUND(SUM(G1:G96)/4000,2)', '=ROUND(SUM(H1:H96)/4000,2)', '=ROUND(SUM(I1:I96)/4000,2)', '=ROUND(SUM(J1:J96)/4000,2)', '=ROUND(SUM(K1:K96)/4000,2)', '=ROUND(SUM(L1:L96)/4000,2)', '=ROUND(SUM(M1:M96)/4000,2)', '=ROUND(SUM(N1:N96)/4000,2)', '=ROUND(SUM(O1:O96)/4000,2)', '=ROUND(SUM(P1:P96)/4000,2)', '=ROUND(SUM(Q1:Q96)/4000,2)', '=ROUND(SUM(R1:R96)/4000,2)', '=ROUND(SUM(S1:S96)/4000,2)', '=ROUND(SUM(T1:T96)/4000,2)', '=ROUND(SUM(U1:U96)/4000,2)']],

      tableOverflow: true,
      tableWidth: '1200px',
      tableHeight: '400px',
      columns: [
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
          width: '150',
          decimal: '.',
          mask: '0.00'
        },
        {
          type: 'numeric',
          title: 'MW',
          width: '100',
          decimal: '.',
          mask: '0.00'
        },
        {
          type: 'numeric',
          title: 'MW',
          width: '100',
          decimal: '.',
          mask: '0.00'
        },
        {
          type: 'numeric',
          title: 'MW',
          width: '100',
          decimal: '.',
          mask: '0.00'
        },
        {
          type: 'numeric',
          title: 'MW',
          width: '100',
          decimal: '.',
          mask: '0.00'
        },
        {
          type: 'numeric',
          title: 'MW',
          width: '100',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '180',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '100',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '225'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '225',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '225',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '100',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '300',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '175',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '175',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '300',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '300',
          decimal: '.',
          mask: '0.00'
        }, {
          type: 'numeric',
          title: 'MW',
          width: '300',
          decimal: '.',
          mask: '0.00'
        },
        {
          type: 'numeric',
          title: 'MVar',
          width: '300',
          decimal: '.',
          mask: '0.00'

        },
      ],
      nestedHeaders: [

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

          }, {
            title: '',
            colspan: 1,

          }, {
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
            colspan: 2,
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

          }, {
            title: '',
            colspan: 1,

          }, {
            title: '',
            colspan: 1,

          },

          {
            title: '',
            colspan: 1,

          },

        ],
      ],
      // Changed to arrow function to access this.toastService
      updateTable: (instance, cell, colIndex, rowIndex, value, displayedValue, cellName) => {

        if (colIndex == 2) {
          const exactValue = value.toString()
          console.log(typeof value);
          if (typeof value !== 'number' && Number.isNaN(Number.parseInt(exactValue))) {
            cell.style.background = '#ffcccb'
            // Changed SWAL to Warning Toast
            this.toastService.show('Your Data has some errors, They are highlighted. Please check and Update', { classname: 'bg-warning text-white', delay: 3000 });
          }

          const modifiedValue = value.toString()
          if (typeof modifiedValue === "number" || !Number.isNaN(Number.parseFloat(modifiedValue))) {
            cell.style.background = 'white';
          }
        }
      },
    });

  }

  formSubmit() {
    this.formsubmit = true;
  }

  confirm() {
    // Check if data is loaded
    if (!this.loadedData) {
      // Changed SWAL to Info/Warning Toast
      this.toastService.show('Please upload and parse a file first!', { classname: 'bg-warning text-white', delay: 3000 });
      return;
    }

    this.submit = true;

    if (this.validationform.valid) {
      // Note: Kept Swal for the CONFIRMATION Dialog as Toasts are not blocking/modal
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
          formData.append('disabledDate', this.validationform.get('disabledDate')!.value);
          formData.append('data', JSON.stringify(this.spreadsheet.nativeElement.jexcel.getData()));

          this.loadingText = 'Uploading...';
          this.uploading = true;

          this.intradayForecast.uploadIntradayData(formData).subscribe((res: any) => {
            this.uploading = false;
            if (res.error) {
              // Changed SWAL to Danger Toast
              this.toastService.show(res.error, { classname: 'bg-danger text-white', delay: 3000 });
            } else {
              // Changed SWAL to Success Toast
              this.toastService.show(res['message'], { classname: 'bg-success text-white', delay: 3000 });
              this.resetForm();
            }
          });
        }
      });
    } else {
      // Added else block to handle invalid form state
      this.toastService.show('Please fill all required fields (State, Date) to proceed.', { classname: 'bg-warning text-white', delay: 3000 });
    }
  }

  resetForm() {
    // Reset Form Controls
    this.validationform.reset();
    
    // Reset State logic (re-apply read-only or default if needed)
    if (this.userData?.role === 'f_user') {
      const st = this.userData.state_id;
      this.validationform.get('state')!.setValue(st);
    } else {
      this.validationform.get('state')!.setValue(''); // Or default for admin
    }

    // Reset Date to Default (fetched from API again)
    this.fetchAndSetDate();

    // Clear File Input (Angular form reset handles model, but just to be safe)
    this.validationform.get('excelFile')!.setValue(null);

    // Reset Spreadsheet Data to Zeroes
    // this.spreadsheet.nativeElement.jexcel.setData(this.data);
    
    // Reset Logic Flags
    this.loadedData = false;
    this.uploading = false;
    this.loadingText = 'Uploading...';
    this.submitted = false;
    this.submit = false;
  }


  get formData() {
    return this.tooltipvalidationform.controls;
  }


  previewButtonClicked() {
    this.previewClicked = true;
  }

  downloadExcel() {
    const excelFilePath = 'assets/Intraday Demand Forecast format (from States).xlsx';
    const a = document.createElement('a');
    a.href = excelFilePath;
    a.download = 'sample.xlsx';
    a.click();
  }


  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.validationform.get('excelFile')!.setValue(file);

    this.loadingText = 'Validating...';
    this.uploading = true;
    const formData = new FormData();
    formData.append('excelFile', file);

    this.intradayForecast.parseIntradayExcel(formData).subscribe({
      next: (res: any) => {
        this.uploading = false;
        if (res.error) {
          // Changed SWAL to Danger Toast
          this.toastService.show(res.error, { classname: 'bg-danger text-white', delay: 3000 });
          this.validationform.get('excelFile')!.setValue(null);
          return;
        }

        this.tempData = res.data;
        // Changed SWAL to Success Toast
        this.toastService.show(res.message, { classname: 'bg-success text-white', delay: 3000 });
        this.spreadsheet.nativeElement.jexcel.setData(this.tempData);
        this.loadedData = true;

        this.confirm();
      },
      error: (err) => {
        this.uploading = false;
        console.error(err);
        // Changed SWAL to Danger Toast
        this.toastService.show('Error parsing file on server.', { classname: 'bg-danger text-white', delay: 3000 });
      }
    });
  }

  getTotalElements(arr: any[][]): number {
    let totalCount = 0;
    for (const row of arr) {
      totalCount += row.length;
    }
    return totalCount;
  }

  hasRole(roles: string[]): boolean {
    if (!this.userData || !this.userData.role) return false;
    const role = this.userData.role.toLowerCase();
    return roles.some(r => r.toLowerCase() === role);
  }

}