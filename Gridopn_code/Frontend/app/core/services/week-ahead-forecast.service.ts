import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url } from '../helpers/urlentry';

@Injectable({
  providedIn: 'root'
})
export class WeekAheadForecastService {

  url = api_url;

  constructor(private http: HttpClient) { }

  fetchWeekAheadDate(formData: any) { 
    return this.http.get<any>(this.url + '/forecastuploaddate')
  } 

  // NEW: Validation API
  parseWeekAheadExcel(formData: FormData) {
    return this.http.post<any>(this.url + '/parseweekaheadexcel', formData);
  }

  // Modified: Uploads JSON data
  uploadWeekAheadData(formData: any) {
    return this.http.post<any>(this.url + '/uploadweekahead', formData)
  }
  
  // Keep legacy method name pointing to new logic if needed
  uploadWeekAheadFile(formData: any) {
    return this.http.post<any>(this.url + '/uploadweekahead', formData)
  }

  fetchFormat() {
    return this.http.get<any>(this.url + '/weekaheadformat')
  }

  fetchRevisions(state: any, fromDate: any, toDate: any) {
    return this.http.post<any>(this.url + '/fetchweekrevisions', {"state": state, "from_date": fromDate, "to_date": toDate})
  }

  fetchRevisionsData(state: any, fromDate: any, toDate: any, revision: any) {
    return this.http.post<any>(this.url + '/fetchweeklyrevisionsdata', {"state": state, "from_date": fromDate, "to_date": toDate, "revision": revision})
  }

downloadWeekAheadReport(state: any, fromDate: any, toDate: any, revision: any) {
    return this.http.post<any>(this.url + '/downloadweekahead', 
      { "state": state, "from_date": fromDate, "to_date": toDate, "revision": revision }, 
      { responseType: 'blob' as 'json' }
    );
  }
}