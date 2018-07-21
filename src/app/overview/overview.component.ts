import {Component, OnInit} from '@angular/core';
import {OpenboxService} from '../services/openbox.service';
import {ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {GraphsComponent} from '../graphs/graphs.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  numApps = 0;
  numOBIs = 0;
  serverUrl: string;
  topologyGraph: { nodes: any[], links: any[] };

  constructor(private openboxService: OpenboxService,
              private scrollToService: ScrollToService) {
    this.serverUrl = openboxService.base;
  }

  ngOnInit() {
    this.openboxService.getTopology()
      .subscribe((data: { nodes: any[], links: any[] }) => {
        data.nodes = data.nodes.map((n) => {
          const isEndpoint = n.id.startsWith('E');
          const isSegment = n.id.startsWith('S');
          if (isEndpoint) {
            n.color = '#607d8b';
          } else if (isSegment) {
            n.color = 'yellow'; // todo: make active obi green
          } else {
            n.color = '#00d207'; // todo: make active obi green
          }

          n.originalBlock = {id: n.id, label: n.label, properties: n.properties};
          return n;
        });
        this.topologyGraph = data;
      });

    this.openboxService.getNumApps().subscribe((numApps: number) => this.numApps = numApps);
  }

  scrollToDetails() {

    this.scrollToService.scrollTo({
      target: 'selectedView'
    });
  }

}
