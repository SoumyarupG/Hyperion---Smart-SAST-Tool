import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url } from '../helpers/urlentry';

@Injectable({
  providedIn: 'root'
})
export class IntradayForecastService {

  url = api_url;

  constructor(private http: HttpClient) { }

  fetchIntradayDate(formData: any) { 
    return this.http.get<any>(this.url + '/forecastuploaddate')
  } 

  // NEW: API to parse the excel file and return JSON data
  parseIntradayExcel(formData: FormData) {
    return this.http.post<any>(this.url + '/parseintradayexcel', formData);
  }

  // Modified: This will now send JSON data, not the file
  uploadIntradayData(formData: any) {
    return this.http.post<any>(this.url + '/uploadintradaydata', formData)
  }

  fetchRevisions(state: any, date: any) {
    return this.http.post<any>(this.url + '/fetchintradayrevisions', {"state": state, "date": date})
  }

  fetchRevisionsData(state: any, date: any, revision: any) {
    return this.http.post<any>(this.url + '/fetchintradayrevisionsdata', {"state": state, "date": date, "revision": revision})
  }

  downloadIntradayReport(state: any, date: any, revision: any) {
    return this.http.post<any>(this.url + '/downloadintraday', {"state": state, "date": date, "revision": revision}, {
      responseType: 'blob' as 'json'
    })
  }
}