import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PendingEntriesService } from 'src/app/core/services/pending-entries.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ToastService} from './toast.service'

@Component({
  selector: 'app-partial-outages',
  templateUrl: './partial-outages.component.html',
  styleUrls: ['./partial-outages.component.scss']
})
export class PartialOutagesComponent {
  breadCrumbItems!: Array<{}>;
  outageForm!: UntypedFormGroup;
  loading = false;

  partialOutages: any[] = [];
  filteredOutages: any[] = [];
  selectedRows: any[] = [];

  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedDateStr: string = '';


  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private pendingEntries: PendingEntriesService,
    private modalService: NgbModal,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Timing Entry' },
      { label: 'Partial Outage Details', active: true }
    ];

    this.outageForm = this.fb.group({
      day: [null, Validators.required]
    });
  }

  onSubmit() {
    if (!this.outageForm.valid) return;
    const raw = this.outageForm.get('day')?.value;
    const selectedDate = new Date(raw);
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    this.selectedDateStr = selectedDate.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    }); // Example: 01 Apr, 2025
    

    this.loading = true;
    this.pendingEntries.getPartialOutageDetail(dateStr).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.status === 'success') {
          this.partialOutages = res.data.map((row: any) => ({ ...row, selected: false }));
          this.applySearch();
        } else {
          this.partialOutages = [];
          this.filteredOutages = [];
        }
      },
      error: () => {
        this.loading = false;
        this.partialOutages = [];
      }
    });
  }

  toggleRowSelection(row: any) {
    row.selected = !row.selected;
    this.updateSelectedRows();
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.filteredOutages.forEach(item => item.selected = checked);
    this.updateSelectedRows();
  }

  updateSelectedRows() {
    this.selectedRows = this.partialOutages.filter(item => item.selected);
  }

  hasSelectedRows(): boolean {
    return this.selectedRows.length > 0;
  }

  openReasonModal(content: any) {
    
    this.updateSelectedRows();

    if (!this.selectedRows.length) return;
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  submitReasons(modal: any) {
    const payload = this.selectedRows
      .filter(row => !!row.reason_not_attaining_full_generation?.trim())
      .map(row => ({
        id: row.id,
        reason_not_attaining_full_generation: row.reason_not_attaining_full_generation.trim()
      }));
  
    if (!payload.length) return alert('Please enter reasons.');
  
    const rawDate = this.outageForm.get('day')?.value;
    const selectedDate = new Date(rawDate);
    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  
    const requestBody = {
      date: formattedDate,
      data: payload
    };
  
    this.pendingEntries.submitPartialOutageDetail(requestBody).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.toastService.show(res["message"], { classname: 'bg-success text-white', delay: 3000 });
            setTimeout(() => {
          window.location.reload()
        }, 3000);
          modal.close();
          this.partialOutages.forEach(row => row.selected = false);
          this.updateSelectedRows();
        } else {
          alert('Failed to save.');
        }
      },
      error: () => alert('Error saving reasons.')
    });
  }
  

  applySearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredOutages = this.partialOutages.filter(row =>
      Object.values(row).some(val =>
        val?.toString().toLowerCase().includes(term)
      )
    );
    this.sortData(); // Re-apply sorting
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortData();
  }

  sortData() {
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.filteredOutages.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      return (valA < valB ? -1 : valA > valB ? 1 : 0) * dir;
    });
  }
}
