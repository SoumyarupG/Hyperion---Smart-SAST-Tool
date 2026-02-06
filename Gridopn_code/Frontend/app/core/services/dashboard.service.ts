import { Injectable } from '@angular/core';
import { api_url } from '../helpers/urlentry';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  url = api_url;

  constructor(private http: HttpClient) { }


  fetchDayUploadStatus() {
    return this.http.get<any>(this.url + '/uploadstatus')
  }


  mapeChart(formData: any) {
    return this.http.post<any>(this.url+'/mapechart', {"params":formData})
  }

  actualForecastComp(formData: any) {
    return this.http.post<any>(this.url+'/actualforecastcomp', {"params":formData})
  }


  breakupActualForecast(formData: any) {
    return this.http.post<any>(this.url+'/breakupactualforecast', {"params":formData})
    // return this.http.post<any>(this.url+'/breakupparameters', {"params":formData})
    
  }

  breakupParameters(formData: any) {
    // return this.http.post<any>(this.url+'/breakupactualforecast', {"params":formData})
    return this.http.post<any>(this.url+'/breakupparameters', {"params":formData})
    
  }

  fetchDayRangeStatus(formDate:any) {
    return this.http.post<any>(this.url + '/dayrangestatus', {"params":formDate}) 
  }

  fetchWeekRangeStatus(formDate:any) {
    return this.http.post<any>(this.url + '/weekrangestatus', {"params":formDate}) 
  }

  fetchMonthRangeStatus(formDate:any) {
    return this.http.post<any>(this.url + '/monthrangestatus', {"params":formDate}) 
  }

  fetchYearRangeStatus(formDate:any) {
    return this.http.post<any>(this.url + '/yearrangestatus', {"params":formDate}) 
  }

  fetchIntradayRangeStatus(formDate:any) {
    return this.http.post<any>(this.url + '/intradayrangestatus', {"params":formDate}) 
  }


  

    fetchMailStatusRangeStatus(formDate:any) {
    return this.http.post<any>(this.url + '/mailstatusrangestatus', {"params":formDate}) 
  }

  getDataStatus(formData: any) {
    // return this.http.post<any>(this.url+'/breakupactualforecast', {"params":formData})
    return this.http.post<any>(this.url+'/getdatastatus', {"params":formData})
    
  }

  getStateWiseStatus(formData: any) {
    // return this.http.post<any>(this.url+'/breakupactualforecast', {"params":formData})
    return this.http.post<any>(this.url+'/getstatewisestatus', {"params":formData})

  }



}
