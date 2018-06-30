import {Component, OnInit} from '@angular/core';
import {OpenboxService} from '../services/openbox.service';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {GraphsComponent} from '../graphs/graphs.component';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})
export class NetworkComponent implements OnInit {
  obi: any;
  selected: any;
  topologyGraph: { nodes: any[], links: any[] };

  constructor(private openboxService: OpenboxService,
              private scrollToService: ScrollToService) {
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
  }

  onSelect(node) {
    console.log('Item clicked', node);
    if (!node.id.startsWith('OBI')) {
      this.selected = {
        json: JSON.stringify(node.originalBlock, null, 2),
        object: node.originalBlock,
        label: node.label
      };
      this.obi = null;
    } else {
      this.openboxService.getOBI(node.dpid)
        .subscribe((data: { dpid, properties, processingGraph: { nodes: any[], links: any[] } }) => {
          data.processingGraph = GraphsComponent.toGraph(data.processingGraph);
          console.log(data);
          this.obi = data;
          this.selected = null;

          this.scrollToService.scrollTo({
            target: 'obiView'
          });
        });
    }

    this.scrollToDetails();

  }

  scrollToDetails() {

    this.scrollToService.scrollTo({
      target: 'selectedView'
    });
  }

}
