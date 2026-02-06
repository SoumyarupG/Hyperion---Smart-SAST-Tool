import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '././core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'velzon';
  constructor(private auth: AuthenticationService) {}

  ngOnInit(): void {
    // Sync BehaviorSubject with localStorage once on app start
    this.auth.refreshCurrentUserFromStorage();
  }
}
