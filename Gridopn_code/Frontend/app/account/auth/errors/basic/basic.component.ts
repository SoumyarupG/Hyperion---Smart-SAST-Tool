import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})
export class BasicComponent implements OnInit {

  year: number = new Date().getFullYear();

  // Dynamic text values:
  code: string = '404';
  title: string = 'SORRY, PAGE NOT FOUND';
  message: string = 'The page you are looking for is not available!';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const param = this.route.snapshot.queryParamMap.get('code');

    if (param === '403') {
      this.code = '403';
      this.title = 'UNAUTHORIZED ACCESS';
      this.message = 'You do not have permission to view this page.';
    }
  }
}
