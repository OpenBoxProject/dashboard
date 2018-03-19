import {Component, OnInit} from '@angular/core';
import {OpenboxService} from '../openbox.service';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {GraphsComponent} from '../graphs/graphs.component';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})
export class NetworkComponent implements OnInit {
  obi: any;
  selectedObiConfig: string;
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
          if (isEndpoint) {
            n.color = n.id.startsWith('E') ? '#607d8b' : 'yellow';
          } else {
            n.color = n.id.startsWith('E') ? '#607d8b' : 'yellow'; // todo: make active obi green
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
    }
      this.obi = null;
    } else {
      this.openboxService.getOBI(node.dpid) // todo: add obi id
        .subscribe((data: { dpid, properties, processingGraph: { nodes: any[], links: any[] } }) => {
          data.processingGraph = GraphsComponent.toGraph(data.processingGraph);
          console.log(data);
          this.obi = data;
          this.selected = null;
          this.selectedObiConfig = JSON.stringify(data.properties, null, 2);

          this.scrollToService.scrollTo({
            target: 'obiView'
          });
        });
    }

    this.scrollToDetails();

  }

  onLegendLabelClick(data) {
    console.log('Item clicked', data);
  }

  onOBIBlockSelect(node) {
    console.log('OBI processing block clicked', node);
    this.selected = {
      json: JSON.stringify(node.originalBlock, null, 2),
      object: node.originalBlock,
      label: node.label
    };
    this.scrollToDetails();
  }

  scrollToDetails() {

    this.scrollToService.scrollTo({
      target: 'selectedView'
    });
  }

  sendReadRequest(selected) {
    console.log(`sending read request to ${this.obi.dpid}/${selected.label}`);
    this.openboxService.sendReadRequest(this.obi.dpid, selected.label)
      .subscribe((data: { xid }) => {
        console.log(data);
      });
  }
}
