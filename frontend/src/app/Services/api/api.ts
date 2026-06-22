import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // GET avec auth optionnelle
  get<T>(path: string, token?: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      headers: this.buildHeaders(token)
    });
  }

  // POST avec auth optionnelle
  post<T>(path: string, body: any, token?: string): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      headers: this.buildHeaders(token)
    });
  }

  private buildHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}