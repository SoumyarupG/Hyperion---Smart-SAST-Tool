import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url } from '../helpers/urlentry';

@Injectable({
  providedIn: 'root'
})
export class MonthAheadForecastService {

  url = api_url;

  constructor(private http: HttpClient) { }

  fetchMonthAheadDate(formData: any) { 
    return this.http.get<any>(this.url + '/forecastuploaddate')
  } 

  // NEW: Validation API
  parseMonthAheadExcel(formData: FormData) {
    return this.http.post<any>(this.url + '/parsemonthaheadexcel', formData);
  }

  // Uploads JSON data
  uploadMonthAheadData(formData: any) {
    return this.http.post<any>(this.url + '/uploadmonthahead', formData)
  }
  
  // Legacy alias
  uploadMonthAheadFile(formData: any) {
    return this.http.post<any>(this.url + '/uploadmonthahead', formData)
  }

  fetchFormat() {
    return this.http.get<any>(this.url + '/monthaheadformat')
  }

  fetchRevisions(state: any, fromDate: any, toDate: any) {
    return this.http.post<any>(this.url + '/fetchmonthrevisions', {"state": state, "from_date": fromDate, "to_date": toDate})
  }

  fetchRevisionsData(state: any, fromDate: any, toDate: any, revision: any) {
    return this.http.post<any>(this.url + '/fetchmonthlyrevisionsdata', {"state": state, "from_date": fromDate, "to_date": toDate, "revision": revision})
  }

  downloadMonthAheadReport(state: any, fromDate: any, toDate: any, revision: any) {
    return this.http.post<any>(this.url + '/downloadmonthahead', 
      { "state": state, "from_date": fromDate, "to_date": toDate, "revision": revision }, 
      { responseType: 'blob' as 'json' }
    );
  }
}