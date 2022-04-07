import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];

  constructor(private http: HttpClient) { }

  getMembers(userParams: UserParams): Observable<PaginatedResult<Member[]>> {
    
    let params = this.getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append("minAge", userParams.minAge.toString());
    params = params.append("maxAge", userParams.maxAge.toString());
    params = params.append("gender", userParams.gender);

    return this.getPaginatedResult<Member[]>(this.baseUrl + "users", params);
  }

  getMember(username: string): Observable<Member>{
    const member = this.members.find(x => x.userName === username);
    if(member != undefined){
      return of(member);
    }
    return this.http.get<Member>(this.baseUrl + "users/" + username);
  }

  updateMember(member: Member): Observable<void>{
    return this.http.put(this.baseUrl + "users", member).pipe(
      map(
        () => {
          const index = this.members.indexOf(member);
          this.members[index] = member;
        }
      )
    );
  }
  
  setMainPhoto(photoId: number): Observable<Object>{
    return this.http.put(this.baseUrl+"users/photos/"+photoId, {});
  }

  deletePhoto(photoId: number): Observable<Object>{
    return this.http.delete(this.baseUrl + "users/photos/" + photoId);
  }

  private getPaginatedResult<T>(url: string, params: HttpParams): Observable<PaginatedResult<T>> {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
    return this.http.get<T>(url, { observe: "response", params }).pipe(map(
      response => {
        paginatedResult.result = response.body;
        if (response.headers.get("Pagination") !== null) {
          paginatedResult.pagination = JSON.parse(response.headers.get("Pagination"));
        }
        return paginatedResult;
      })
    );
  }

  private getPaginationHeaders(pageNumber: number, pageSize: number){
    let params = new HttpParams();

    params = params.append("pageNumber",pageNumber.toString());
    params = params.append("pageSize",pageSize.toString());

    return params;

  }
}
