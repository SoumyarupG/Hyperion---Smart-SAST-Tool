import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url } from '../helpers/urlentry';

@Injectable({
  providedIn: 'root'
})
export class ResourceAdequacyService {

  private baseUrl = `${api_url}/share-allocation`;

  constructor(private http: HttpClient) {}

  // ===============================
  // UPLOAD SHARE ALLOCATION
  // ===============================
  uploadShareAllocation(formData: FormData) {
    return this.http.post(
      `${this.baseUrl}/upload`,
      formData
    );
  }

  // ===============================
  // VIEW CURRENT SHARE ALLOCATION
  // ===============================
  getCurrentShareAllocation() {
    return this.http.get<any>(
      `${this.baseUrl}/current`
    );
  }


  downloadShareAllocationFormat() {
  return this.http.get(
    `${this.baseUrl}/download-format`,
    { responseType: 'blob' }
  );
}

    downloadCurrentShareAllocation(allocationDate: string) {
  return this.http.get(
    `${this.baseUrl}/download-file`,
    {
      params: { allocation_date: allocationDate },
      responseType: 'blob'
    }
  );
}


}
