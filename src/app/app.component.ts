import {Component, OnInit, ElementRef} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'OpenBox Dashboard';
  testGraph = {
    nodes: [
      {
        id: 'start',
        label: 'start'
      }, {
        id: '1',
        label: 'Query ThreatConnect',
      }, {
        id: '2',
        label: 'Query XForce',
      }, {
        id: '3',
        label: 'Format Results'
      }, {
        id: '4',
        label: 'Search Splunk'
      }, {
        id: '5',
        label: 'Block LDAP'
      }, {
        id: '6',
        label: 'Email Results'
      }
    ],
    links: [
      {
        source: 'start',
        target: '1',
        label: 'links to'
      }, {
        source: 'start',
        target: '2'
      }, {
        source: '1',
        target: '3',
        label: 'related to'
      }, {
        source: '2',
        target: '4'
      }, {
        source: '2',
        target: '6'
      }, {
        source: '3',
        target: '5'
      }
    ]
  };

  ngOnInit(): void {
  }

  isActive(link) {
    return link.classList.contains('active-link');
  }
}
