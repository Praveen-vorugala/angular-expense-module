import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { isNotBlank, isNotNull } from 'src/app/utils/utils-function';
import { GET_REQUEST, POST_REQUEST, PUT_REQUEST, PATCH_REQUEST, DELETE_REQUEST } from 'src/constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {

  constructor(private httpClient: HttpClient) { }


  public getHttpParams(params?: Map<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (params && params.size > 0) {
        params.forEach((value, key) => {
            if (isNotNull(value)) {
                httpParams = httpParams.append(key, String(value));
            }
        });
    }
    return httpParams;
  }
  
  public getBasicHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    return headers
        .append('Accept', 'application/json')
        .append('Content-Type', 'application/json')
        .append('client', 'Expense Module')
        .append('app-version', environment.version)
  }

  public getHeaders(values?: Map<string, string>): HttpHeaders {
    let headers: HttpHeaders = this.getBasicHeaders();
    if (values && values.size > 0) {
        values.forEach((value, key) => {
            if (isNotBlank(value)) {
                headers = headers.append(key, value);
            } else {
                headers = headers.delete(key);
            }
        });
    }
    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error); 
  }
  
  private getFinalURL(requestOptions: Request,requestType:string): string {
    return environment.apiUrl+ requestOptions.url;
  }

  public get<T>(requestOptions: Request): Observable<T> {
    let finalUrl = this.getFinalURL(requestOptions,GET_REQUEST);
    let httpParams = this.getHttpParams(requestOptions.params);
    if (requestOptions.skipAuthHeader) {
        httpParams = httpParams.set('skip-interceptor', 'true');
    }
    let httpHeaders = this.getHeaders(requestOptions.headers);
    let $call: Observable<any>;
    switch (requestOptions.responseType) {
        case ResponseType.ARRAY_BUFFER:
            $call = this.httpClient.get(finalUrl, {
                params: httpParams,
                headers: httpHeaders,
                responseType: ResponseType.ARRAY_BUFFER
            });
            break;
        case ResponseType.TEXT:
            $call = this.httpClient.get(finalUrl, {
                params: httpParams,
                headers: httpHeaders,
                responseType: ResponseType.TEXT
            });
            break;

        case ResponseType.BLOB:
            $call = this.httpClient.get(finalUrl, {
                params: httpParams,
                headers: httpHeaders,
                responseType: ResponseType.BLOB
            });
            break;

        default:
            $call = this.httpClient.get(finalUrl, {
                params: httpParams,
                headers: httpHeaders,
            });
            break;
    }
    return $call.pipe(catchError(this.handleError.bind(this)));
  }

  public executeGet(requestOptions: Request): Observable<any> {
    return this.get<any>(requestOptions);
  }

  public post<T>(requestOptions: PostRequest<T>): Observable<T> {
    let finalUrl = this.getFinalURL(requestOptions,POST_REQUEST);
    let httpParams = this.getHttpParams(requestOptions.params);
    let httpHeaders = this.getHeaders(requestOptions.headers);
    if (requestOptions.skipAuthHeader) {
        httpParams = httpParams.set('skip-interceptor', 'true');
    }
    if (requestOptions.body instanceof FormData) {
        httpHeaders = httpHeaders.delete('Content-Type');
    }
    let $call: Observable<any>;
    switch (requestOptions.responseType) {
        case ResponseType.ARRAY_BUFFER:
            $call =this.httpClient.post(finalUrl, requestOptions.body, {
                params: httpParams,
                headers: httpHeaders,
                responseType: ResponseType.ARRAY_BUFFER
            })
            break;
        case ResponseType.TEXT:
            $call = this.httpClient.post(finalUrl, requestOptions.body, {
                params: httpParams,
                headers: httpHeaders,
                responseType: ResponseType.TEXT
            })
            break;
        case ResponseType.BLOB:
            $call =  this.httpClient.post(finalUrl, requestOptions.body, {
                params: httpParams,
                headers: httpHeaders,
                responseType: ResponseType.BLOB
            })
            break;

        default:
            $call = this.httpClient.post(finalUrl, requestOptions.body, {
                params: httpParams,
                headers: httpHeaders,
                
            })
            break;
    }
    return $call.pipe(catchError(this.handleError.bind(this)));
}

  public executePost(requestOptions: PostRequest<any>): Observable<any> {
    return this.post<any>(requestOptions);
  }
  
  public executePut<T>(request: PostRequest<T>): Observable<any> {
    let finalUrl = this.getFinalURL(request,PUT_REQUEST);
    let httpParams = this.getHttpParams(request.params);
    let httpHeaders = this.getHeaders(request.headers);
    if (request.body instanceof FormData) {
        httpHeaders = httpHeaders.delete('Content-Type');
    }
    return this.httpClient.put(finalUrl, request.body, {
        params: httpParams,
        headers: httpHeaders
    }).pipe(catchError(this.handleError.bind(this)));
}

public executePatch<T>(request: PostRequest<T>): Observable<any> {
    let finalUrl = this.getFinalURL(request,PATCH_REQUEST);
    let httpParams = this.getHttpParams(request.params);
    let httpHeaders = this.getHeaders(request.headers);
    if (request.body instanceof FormData) {
        httpHeaders = httpHeaders.delete('Content-Type');
    }
    return this.httpClient.patch(finalUrl, request.body, {
        params: httpParams,
        headers: httpHeaders
    }).pipe(catchError(this.handleError.bind(this)));
}

public executeDelete<T>(request: Request): Observable<any> {
    let finalUrl = this.getFinalURL(request,DELETE_REQUEST);
    let httpParams = this.getHttpParams(request.params);
    let httpHeaders = this.getHeaders(request.headers);
    return this.httpClient.delete(finalUrl, {
        params: httpParams,
        headers: httpHeaders
    }).pipe(catchError(this.handleError.bind(this))) as Observable<any>;
}
  
}

export interface Request {
  url: string;
  params?: Map<string, any>;
  headers?: Map<string, string>;
  responseType?: ResponseType;
  isAbsoluleURL?: boolean;
  skipAuthHeader?: boolean;
  service?: string;
}

export interface PostRequest<T> extends Request {
  body: T;
}

export enum ResponseType {
  ARRAY_BUFFER = "arraybuffer",
  BLOB = "blob",
  JSON = "json",
  TEXT = "text",
}