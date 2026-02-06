import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private authenticationService: AuthenticationService, public router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            // console.log("below is error")
            // console.log(err);
            // console.log("Above is error")
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                // Show SweetAlert on session expiry
            Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'Please log in again. Redirecting...',
                timer: 2000,
                timerProgressBar: true,
            }).then(() => {
              this.authenticationService.logout(); //  Logout user
              this.router.navigate(['/login']); //  Redirect to login
            });
            }
            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }

    timer() {
        let timerInterval: any;
        Swal.fire({
          title: 'Auto close alert!',
          html: 'I will close in <b></b> milliseconds.',
          timer: 2000,
          timerProgressBar: true,
          didOpen: () => {
            timerInterval = setInterval(() => {
              const content = Swal.getHtmlContainer();
              if (content) {
                const b: any = content.querySelector('b');
                if (b) {
                  b.textContent = Swal.getTimerLeft();
                }
              }
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        }).then((result) => {
          /* Read more about handling dismissals below */
          if (result.dismiss === Swal.DismissReason.timer) {
          }
        });
      }
}
