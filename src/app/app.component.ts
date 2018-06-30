import {Component, OnInit, ElementRef} from '@angular/core';
import {OpenboxService} from './services/openbox.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  online = true;

  title = 'OpenBox Dashboard';

  constructor(private openboxService: OpenboxService) {
    openboxService.onControllerConnect.subscribe(({online}) => {
      this.online = online;
    });
  }

  ngOnInit(): void {
  }

  isActive(link) {
    return link.classList.contains('active-link');
  }
}
