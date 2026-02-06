import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { PendingEntriesService } from 'src/app/core/services/pending-entries.service';
import { debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from './toast-service';

@Component({
  selector: 'app-gen-outages',
  templateUrl: './gen-outages.component.html',
  styleUrls: ['./gen-outages.component.scss']
})
export class GenOutagesComponent {

  loading: boolean = false;
  validationMessage: string = '';
  isUpdating: boolean = false;

  // validationMessage: string = '';
  validationType: 'success' | 'warning' | 'danger' = 'success';


  @ViewChild('statusModal') statusModalRef!: TemplateRef<any>;
  selectedUnit: any = null;
  updateData = {
    inTime: '',
    outTime: '',
    expTime: '',
    reason: ''
};



  breadCrumbItems!: Array<{}>;
  selectedOption: string = 'thermal';
  groupedByState: any[] = [];

  originalData: any[] = []; // Raw untouched data
  searchControl = new FormControl('');
  sortColumn: string = 'state';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private httpClient: HttpClient, private getGenOutages: PendingEntriesService,
    private modalService: NgbModal,  public toastService: ToastService) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Timing Entry' },
      { label: 'Gen Outages', active: true }
    ];

    this.fetchGenOutages("thermal");

    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      this.applyFilterAndGroup(value);
    });
  }

  cleanDetails = (details: string) =>
    details ? details.replace(/<hr.*?>/g, '<br>') : '';

  fetchGenOutages(parameter: any): void {
    this.loading = true; // show spinner
    this.getGenOutages.genOutages(parameter).subscribe({
      next: (res) => {
        this.loading = false; // hide spinner
        if (res.status === 'success') {
          this.originalData = res.data;
          this.applyFilterAndGroup(this.searchControl.value || '');
        }
      },
      error: (err) => {
        this.loading = false; // hide spinner
        console.error('Error fetching gen outages:', err);
      }
    });
  }

  onTabChange(tab: string): void {
    this.selectedOption = tab;
    this.fetchGenOutages(tab as 'thermal' | 'hydro');
  }

  applyFilterAndGroup(keyword: string): void {
    const lower = keyword.toLowerCase();
    const filtered = this.originalData.filter(entry =>
      entry.state?.toLowerCase().includes(lower) ||
      entry.station_name?.toLowerCase().includes(lower) ||
      entry.unit_name?.toLowerCase().includes(lower) ||
      entry.status?.toLowerCase().includes(lower) ||
      entry.details?.toLowerCase().includes(lower)
    );

    this.groupedByState = this.groupAndSortData(filtered);
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilterAndGroup(this.searchControl.value || '');
  }

  groupAndSortData(data: any[]): any[] {
    const stateMap = new Map<string, Map<string, any>>();

    data.forEach((entry: any) => {
      const state = entry.state;
      // const station = entry.station_name;

      const station = `${entry.station_name} (${entry.Units})`;

      const unit_string = entry.Units;

      if (!stateMap.has(state)) {
        stateMap.set(state, new Map());
      }

      const stationMap = stateMap.get(state);
      if (!stationMap.has(station)) {
        stationMap.set(station, {
          station_name: station,
          unit_string: unit_string,
          units: []
        });
      }

      stationMap.get(station).units.push({
        unit_name: entry.unit_name,
        ic: entry.ic,
        status: entry.status,
        color: entry.color,
        outage_category: entry.outageCategory,
        time_dday: entry.time_dday,
        days_in: entry.days_in,
        details: this.cleanDetails(entry.details)
      });
    });

    // Convert to array and sort as needed
    const grouped = Array.from(stateMap.entries()).map(([state, stationsMap]) => {
      const stationsArray = Array.from(stationsMap.values());

      // Sort stations
      if (this.sortColumn === 'station_name' || this.sortColumn === 'ic') {
        stationsArray.sort((a: any, b: any) => {
          const valA = (a[this.sortColumn] || '').toString().toLowerCase();
          const valB = (b[this.sortColumn] || '').toString().toLowerCase();
          return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
      }

      // Sort units inside each station
      stationsArray.forEach((station: any) => {
        if (this.sortColumn === 'unit_name' || this.sortColumn === 'status') {
          station.units.sort((a: any, b: any) => {
            const valA = (a[this.sortColumn] || '').toString().toLowerCase();
            const valB = (b[this.sortColumn] || '').toString().toLowerCase();
            return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          });
        }
      });

      const rowspan = stationsArray.reduce((sum, station: any) => sum + station.units.length, 0);

      return {
        state,
        rowspan,
        stations: stationsArray
      };
    });

    // Sort state level
    if (this.sortColumn === 'state') {
      grouped.sort((a: any, b: any) => {
        const valA = a.state?.toLowerCase() || '';
        const valB = b.state?.toLowerCase() || '';
        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return grouped;
  }


  openStatusModal(unit: any): void {
    this.selectedUnit = unit;
    this.updateData = {
      inTime: '',
      outTime: '',
      expTime: '',
      reason: ''
    };
    this.modalService.open(this.statusModalRef, { size: 'md', backdrop: 'static' });
  }

  submitStatusUpdate(): void {
    this.validationMessage = ''; // reset
  
    const newStatus = this.selectedUnit.status === 'Closed' ? 'Open' : 'Closed';
  
    if (newStatus === 'Closed') {
      if (!this.updateData.inTime) {
        this.validationMessage = 'Please provide In Time.';
        return;
      }
    }
  
    if (newStatus === 'Open') {
      if (!this.updateData.outTime || !this.updateData.expTime || !this.updateData.reason?.trim()) {
        this.validationMessage = 'Please provide Out Time, Expected Restoration and Reason.';
        return;
      }
    }
  
    const payload = {
      elementId: this.selectedUnit.unit_name,
      newStatus: newStatus,
      ...this.updateData
    };


    // console.log(this.selectedUnit);
    // console.log('Payload to send:', payload);

    this.isUpdating = true;

    this.getGenOutages.submitGenOutageDetail(payload).subscribe({
      next: (res) => {
        this.isUpdating = false;
  
        if (res.status === 'success') {
          this.validationMessage = res.message;
          this.validationType = 'success';
  
          setTimeout(() => {
            this.modalService.dismissAll();
            window.location.reload();
          }, 3000);
        } else {
          this.validationMessage = res.message || 'Update failed.';
          this.validationType = 'danger';
        }
      },
      error: (err) => {
        this.isUpdating = false;
        console.error('Error:', err);
        this.validationMessage = 'Something went wrong!';
        this.validationType = 'danger';
      }
    });
    



  }
  
}