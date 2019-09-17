import {Component, OnInit, ElementRef} from '@angular/core';
import {OpenboxService} from './services/openbox.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  controllerHost: string;
  online = false;
  showMenu = false;

  title = 'OpenBox Dashboard';
  postInit: Boolean = false;

  constructor(private openboxService: OpenboxService) {
    openboxService.onControllerConnect.subscribe(({online}) => {
      this.online = online;
    });
    this.controllerHost = openboxService.controllerHost;
    setTimeout(() => this.postInit = true, 3000);
  }

  ngOnInit(): void {
  }

  isActive(link) {
    return link.classList.contains('active-link');
  }

  onUpdateControllerHost() {
    this.openboxService.updateControllerHost();
  }
}
