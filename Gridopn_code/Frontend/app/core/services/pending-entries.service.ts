import { Injectable } from '@angular/core';
import { api_url } from '../helpers/urlentry';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PendingEntriesService {

  url = api_url;

  constructor(private http: HttpClient) { }

  fetchPendingEntry() {
    return this.http.get<any>(this.url + '/pendingentries')
  }

  submitEntries(data: any) {
    return this.http.post<any>(this.url + '/submitentries', {data: data})
  }

  previousCodes (formDate:any) {
    return this.http.post<any>(this.url + '/getelementpreviouscodes', {"params":formDate}) 
  }

  genOutages (parameter: any) {
    return this.http.post<any>(this.url + '/genoutages', {"type": parameter})
  }

  submitGenOutageDetail (parameters: any) {
    return this.http.post<any>(this.url + '/submitoutagedetail', {"data": parameters})
  }


  getPartialOutageDetail (parameters: any) {
    return this.http.post<any>(this.url + '/getpartialoutagedetail', {"date": parameters})
  }

  submitPartialOutageDetail (parameters: any) {
    return this.http.post<any>(this.url + '/submitpartialoutagedetail', {"data": parameters})
  }




}
