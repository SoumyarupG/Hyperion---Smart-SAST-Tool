import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url } from '../helpers/urlentry';

@Injectable({
  providedIn: 'root'
})
export class DayAheadForecastService {

  url = api_url;

  constructor(private http: HttpClient) { }

  fetchDayAheadDate(formData: any) { 
    return this.http.get<any>(this.url + '/forecastuploaddate')
  } 

  // NEW: API to parse excel
  parseDayAheadExcel(formData: FormData) {
    return this.http.post<any>(this.url + '/parsedayaheadexcel', formData);
  }

  // Modified: Uploads JSON data
  uploadDayAheadData(formData: any) {
    return this.http.post<any>(this.url + '/uploaddayahead', formData)
  }
  
  // Keep existing method for backward compatibility if needed, but it calls the same URL
  uploadDayAheadFile(formData: any) {
    return this.http.post<any>(this.url + '/uploaddayahead', formData)
  }

  fetchRevisions(state: any, date: any) {
    return this.http.post<any>(this.url + '/fetchrevisions', {"state": state, "date": date})
  }

  fetchRevisionsData(state: any, date: any, revision: any) {
    return this.http.post<any>(this.url + '/fetchrevisionsdata', {"state": state, "date": date, "revision": revision})
  }

  fetchPendingEntry() {
    return this.http.get<any>(this.url + '/pendingentries')
  }

  downloadDayAheadReport(state: any, date: any, revision: any) {
    return this.http.post<any>(this.url + '/downloaddayahead', {"state": state, "date": date, "revision": revision}, {
      responseType: 'blob' as 'json'
    })
  }
}