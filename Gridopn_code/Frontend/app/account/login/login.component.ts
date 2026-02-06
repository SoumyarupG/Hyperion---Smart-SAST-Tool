import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Login Auth
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { first } from 'rxjs/operators';
import { ToastService } from './toast-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})





/**
 * Login Component
 */
export class LoginComponent implements OnInit {

  @ViewChild('captchaRef') captchaRef: any;


  loading: boolean= false;
  

  siteKey: string = '6LftdjQqAAAAAO8bAfW50GrYNKlkXXwRSMEk7IXj';

  captchaResolved: boolean = false;
  captchaToken: string | null = null;

  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  // set the current year
  year: number = new Date().getFullYear();

  constructor(private formBuilder: UntypedFormBuilder,private authenticationService: AuthenticationService,private router: Router,
    private authFackservice: AuthfakeauthenticationService,private route: ActivatedRoute, public toastService: ToastService, ) {
      // redirect to home if already logged in
      if (this.authenticationService.currentUserValue) {
        this.router.navigate(['/']);
      }
     }

  ngOnInit(): void {
    if(localStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }
    /**
     * Form Validatyion
     */
     this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onCaptchaResolved(token: string): void {
    this.captchaResolved = true;
    this.captchaToken = token;
    // console.log(`Resolved captcha with response: ${token}`);
  }

  /**
   * Form submit
   */

  // Helper function to generate a UUID for device_id
generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}




onSubmit() {

  this.loading = true;
  this.submitted = true;

  this.authenticationService.login(
    this.f['email'].value,
    this.f['password'].value,
    this.captchaToken as string
  ).subscribe({
    next: (data: any) => {
      this.loading = false;

      if (data?.status === 'success') {

        // Save user
        localStorage.setItem('currentUser', JSON.stringify(data));

        // Verify /me
        this.authenticationService.me().subscribe({
          next: (me: any) => {
            if (me.status === 'success') {
              localStorage.setItem('me', JSON.stringify(me));
              this.router.navigate(['/']);
            } else {
              this.toastService.show('Authentication failed', { classname: 'bg-danger text-light' });
              this.resetCaptcha();
              this.router.navigate(['/login']);
            }
          },
          error: () => {
            this.toastService.show('Authentication failed', { classname: 'bg-danger text-light' });
            this.resetCaptcha();
            this.router.navigate(['/login']);
          }
        });

      } else {
        this.toastService.show(data?.error || 'Invalid credentials', {
          classname: 'bg-danger text-light'
        });
        this.resetCaptcha();   // <—— Refresh captcha
      }
    },

    error: (err) => {
      this.loading = false;
      this.toastService.show('Server error during login', {
        classname: 'bg-danger text-light'
      });
      this.resetCaptcha();   // <—— Refresh captcha
      console.error(err);
    }
  });
}


  /**
   * Password Hide/Show
   */
   toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  // RESET CAPTCHA

resetCaptcha() {
  this.captchaResolved = false;
  this.captchaToken = null;

  if (this.captchaRef) {
    this.captchaRef.reset();
  }
}

}
