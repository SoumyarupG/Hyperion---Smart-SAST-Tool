// ...existing code...
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url } from '../helpers/urlentry';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  url = api_url+'/reports';

  constructor(private http: HttpClient) { }

  // API call for merged demand forecast mail
  sendMergedDemandForecastMail() {
    return this.http.get<any>(`${this.url}/sendmergeddemandforecastmail`);
  }

  
  lineFlowReport (formDate:any) {
    return this.http.post<any>(this.url + '/lineflows', {"params":formDate}) 
  }

    // Function to download the file as a Blob
    downloadLineFlowsReport(downloadLink: any): Observable<Blob> {
      return this.http.post(this.url + '/downloadlineflows', { "downloadLink": downloadLink}, { responseType: 'blob' });
    }


    FetchDescription() {
      return this.http.get<any>(this.url + '/fetchmdpdescription') 
    }


    fetchDescriptionBasedData(formData: any) {
    
      return this.http.post<any>(this.url + '/mdpdescriptiondata', {"params":formData}) 

    }


    // New API for forecast mail status
    sendForecastMailApi(body: { type: string, from_date: string, to_date: string }) {
      return this.http.post<any>(this.url+'/forecastmailstatus', body);
    }

    // Existing imports and class remain same
    downloadConsolidatedFile(body: { type: string; from_date: string; to_date: string }) {
      return this.http.post(`${this.url}/downloadconsolidatedfile`, body, {
        responseType: 'blob'
      });
    }


}
