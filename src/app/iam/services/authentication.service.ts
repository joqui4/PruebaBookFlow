import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SignInRequest } from '../model/sign-in.request';
import { SignInResponse } from '../model/sign-in.response';
import { environment } from '../../../environments/environment';
import { SignUpRequest } from '../model/sign-up.request';
import { SignUpResponse } from '../model/sign-up.response';

/**
 * Service for authentication.
 * @summary
 * This service provides methods for signing up, signing in, and signing out.
 * It also provides observables for the signed in status, the signed-in user ID, and the signed-in username.
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  basePath: string = `${environment.serverBasePath}`;
  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  private signedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private signedInUserId: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private signedInUsername: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private router: Router, private http: HttpClient) {}

  get isSignedIn() {
    return this.signedIn.asObservable();
  }

  get currentUserId() {
    return this.signedInUserId.asObservable();
  }

  get currentUsername() {
    return this.signedInUsername.asObservable();
  }

  /**
   * Sign up a new user.
   * @param signUpRequest The sign up request.
   * @returns The sign up response.
   */
  signUp(signUpRequest: SignUpRequest) {
    console.log(signUpRequest);
    return this.http.post<SignUpResponse>(`${this.basePath}/authentication/sign-up`, signUpRequest, this.httpOptions)
      .subscribe({
        next: (response) => {
          console.log(`Signed up as ${response.username} with id: ${response.id}`);
          this.router.navigate(['/sign-in']).then();
        },
        error: (error) => {
          console.error(`Error while signing up: ${error}`);
          this.router.navigate(['/sign-up']).then();
        }
      });
  }

  /**
   * Sign in a user.
   * @param signInRequest The sign in request.
   * @returns The sign in response.
   */
  signIn(signInRequest: SignInRequest) {
    console.log(signInRequest);
    return this.http.post<SignInResponse>(`${this.basePath}/authentication/sign-in`, signInRequest, this.httpOptions)
      .subscribe({
        next: (response) => {
          this.signedIn.next(true);
          this.signedInUserId.next(response.id);
          this.signedInUsername.next(response.email);
          localStorage.setItem('token', response.token);
          console.log(`Signed in as ${response.email} with token ${response.token}`);
          this.router.navigate(['home/Catalogue']).then();
        },
        error: (error) => {
          this.signedIn.next(false);
          this.signedInUserId.next(0);
          this.signedInUsername.next('');
          console.error(`Error while signing in: ${error}`);
          this.router.navigate(['/sign-in']).then();
        }
      });
  }

  /**
   * Sign out a user.
   *
   * This method signs out a user by clearing the token from local storage and navigating to the sign-in page.
   */
  signOut() {
    this.signedIn.next(false);
    this.signedInUserId.next(0);
    this.signedInUsername.next('');
    localStorage.removeItem('token');
    this.router.navigate(['/sign-in']).then();
  }
}
