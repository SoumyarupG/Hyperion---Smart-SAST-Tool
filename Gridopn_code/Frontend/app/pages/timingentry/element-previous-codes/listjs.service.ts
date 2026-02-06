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
// import { ToastService } from './toast-service';


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
export class OrdersService1 {
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


  

  constructor(private pipe: DecimalPipe, private http: HttpClient, private pendingEntries: PendingEntriesService) {

    // this.pendingEntries.fetchPendingEntry().subscribe((res: any) => {
    //   this.Listjs = res["data"];
    //   if(this.Listjs.length > 0) {
    //     // this.toastService.show('Data Fetched Successfully!', { classname: 'bg-success text-white', delay: 3000 });

    //     for (const item of this.Listjs) {
    //       const date = new Date(item.codeIssueTime);
    //       item.codeIssueTime = date.toLocaleString('en-GB', {
    //         year: 'numeric',
    //         month: '2-digit',
    //         day: '2-digit',
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: false // Use 24-hour format
    //       });
    //     }


    //   }

    //   else {
    //     // this.toastService.show('Data is Empty!', { classname: 'bg-success text-white', delay: 3000 });


    //   }

    // }
              
    // )



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



  // Method to fetch previous codes based on form data
  getPreviousCodes(formData: any): Observable<any> {
    return this.pendingEntries.previousCodes(formData).pipe(
      tap((res: any) => {
        if (res.status === 'success') {
          this.Listjs = res.data; // Assign the fetched data to Listjs
          this._set({ page: 1 }); // Reset to page 1
          this._search$.next(); // Trigger search to update table
          for (const item of this.Listjs) {
                  const date = new Date(item.codeIssueTime);
                  item.codeIssueTime = date.toLocaleString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false // Use 24-hour format
                  });
                }
        }
      })
    );
  }



}
