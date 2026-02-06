/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import {Injectable, PipeTransform} from '@angular/core';

import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

import {ListJsModel} from './listjs.model';
import {ListJs} from './data';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import {SortColumn, SortDirection} from './listjs-sortable.directive';
import { HttpClient } from '@angular/common/http';
import { PendingEntriesService } from 'src/app/core/services/pending-entries.service';
import { ToastService } from './toast-service';


interface SearchResult {
  countries: ListJsModel[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

let listValue;

function sort(countries: ListJsModel[], column: SortColumn, direction: string): ListJsModel[] {
  if (direction === '' || column === '') {
    return countries;
  } else {
    return [...countries].sort((a: any, b: any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(country: ListJsModel, term: string, pipe: PipeTransform) {
  // return country.customer_name.toLowerCase().includes(term.toLowerCase())
  // || country.email.toLowerCase().includes(term.toLowerCase())
  // || country.phone.toLowerCase().includes(term.toLowerCase())
  // || country.date.toLowerCase().includes(term.toLowerCase())
  // || country.status.toLowerCase().includes(term.toLowerCase());


  return  country.elementType.toLowerCase().includes(term.toLowerCase())
  || country.elementName.toLowerCase().includes(term.toLowerCase())
  || country.switching.toLowerCase().includes(term.toLowerCase())
  || country.category.toLowerCase().includes(term.toLowerCase())
  || country.codeIssuedTo.toLowerCase().includes(term.toLowerCase())
  || country.codeRequestedBy.toLowerCase().includes(term.toLowerCase())
  || country.srldcCode.toLowerCase().includes(term.toLowerCase())
  || country.nldcCode.toLowerCase().includes(term.toLowerCase());

}

@Injectable({providedIn: 'root'})
export class OrdersService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _countries$ = new BehaviorSubject<ListJsModel[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 50,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    startIndex: 0,
    endIndex: 100,
    totalRecords: 0
  };

  Listjs: any =  [];


  

  constructor(private pipe: DecimalPipe, private http: HttpClient, private pendingEntries: PendingEntriesService, public toastService: ToastService) {

    let previousData: any[] = [];

    const formatDate = (item: any) => {
      const date = new Date(item.codeIssueTime);
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const hours = ('0' + date.getHours()).slice(-2);
      const minutes = ('0' + date.getMinutes()).slice(-2);
      item.codeIssueTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    //  Detect NEW entries by srldcCode
    const detectNewEntries = (oldData: any[], newData: any[]) => {
      return newData.filter(newItem => {
        return !oldData.some(oldItem => oldItem.srldcCode === newItem.srldcCode);
      });
    };
    
    //  Detect REMOVED entries by srldcCode
    const detectRemovedEntries = (oldData: any[], newData: any[]) => {
      return oldData.filter(oldItem => {
        return !newData.some(newItem => newItem.srldcCode === oldItem.srldcCode);
      });
    };
    
    //  Main fetch logic
    const fetchAndCompare = () => {
      console.log('⏰ Fetching data at:', new Date().toLocaleString());
    
      this.pendingEntries.fetchPendingEntry().subscribe((res: any) => {
        const newData = res["data"];
    
        if (newData && newData.length > 0) {
          newData.forEach(formatDate);
    
          const newEntries = detectNewEntries(previousData, newData);
          const removedEntries = detectRemovedEntries(previousData, newData);
    
          //  Notify new entries
          if (newEntries.length > 0) {
            console.log("Toast displayed for new entry")
            newEntries.forEach(entry => {
              this.toastService.show(
                `🔔 <b>New Entry Received</b><br>
                <b>SRLDC Code:</b> ${entry.srldcCode}<br>
                <b>Element:</b> ${entry.elementName}<br>
                <b>Switching:</b> ${entry.switching}<br>
                <b>Category:</b> ${entry.category}`,
                { classname: 'bg-info text-white', 
                  delay: 30000,
                  // autohide: false // 👈 this disables auto close 
                }
              );
            });
          }
    
          //  Notify removed entries
          // if (removedEntries.length > 0) {
          //   console.log("Timing entered and toast displayed for Existing entry") 
          //   removedEntries.forEach(entry => {
          //     this.toastService.show(
          //       ` <b>Timing Entered</b><br>
          //       <b>SRLDC Code:</b> ${entry.srldcCode}<br>
          //       <b>Element:</b> ${entry.elementName}<br>
          //       <b>Switching:</b> ${entry.switching}<br>
          //       <b>Category:</b> ${entry.category}`,
          //       { classname: 'bg-danger text-white', 
          //         // delay: 10000 
          //         }
          //     );
          //   });
          // }
    
          this.Listjs = newData;
          previousData = JSON.parse(JSON.stringify(newData)); // Deep copy
        } else {
          this.toastService.show('Data is Empty!', {
            classname: 'bg-warning text-white', delay: 3000
          });
    
          // //  If data becomes empty, all previous entries are removed
          // if (previousData.length > 0) {
          //   previousData.forEach(entry => {
          //     this.toastService.show(
          //       `❌ <b>Entry Removed</b><br>
          //       <b>SRLDC Code:</b> ${entry.srldcCode}<br>
          //       <b>Element:</b> ${entry.elementName}<br>
          //       <b>Switching:</b> ${entry.switching}<br>
          //       <b>Category:</b> ${entry.category}`,
          //       { classname: 'bg-danger text-white', delay: 10000 }
          //     );
          //   });
          // }
    
          this.Listjs = [];
          previousData = [];
        }
      });
    };
    
    //  Initial call + 3-minute interval (or 30 seconds for test)
    fetchAndCompare();
    setInterval(fetchAndCompare, 1 * 60 * 1000);
    


    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._countries$.next(result.countries);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  get countries$() { 
    return this._countries$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }
  get startIndex() { return this._state.startIndex; }
  get endIndex() { return this._state.endIndex; }
  get totalRecords() { return this._state.totalRecords; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }
  set startIndex(startIndex: number) { this._set({ startIndex }); }
  set endIndex(endIndex: number) { this._set({ endIndex }); }
  set totalRecords(totalRecords: number) { this._set({ totalRecords }); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

  

    // 1. sort
    let countries = sort(this.Listjs, sortColumn, sortDirection);

    // 2. filter
    countries = countries.filter(country => matches(country, searchTerm, this.pipe));
    const total = countries.length;

    // 3. paginate
    this.totalRecords = countries.length;
    this._state.startIndex = (page - 1) * this.pageSize + 1;
    this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
    }
    countries = countries.slice(this._state.startIndex - 1, this._state.endIndex);
    return of({countries, total});
  }


}
