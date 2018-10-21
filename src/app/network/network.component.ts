import {Component, OnDestroy, OnInit} from '@angular/core';
import {OpenboxService} from '../services/openbox.service';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {GraphsComponent} from '../graphs/graphs.component';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})
export class NetworkComponent implements OnInit, OnDestroy {
  obi: any;
  selected: any;
  topologyGraph: { nodes: any[], links: any[] };
  topologySubscription: Subscription;

  constructor(private openboxService: OpenboxService,
              private scrollToService: ScrollToService) {
  }

  ngOnInit() {
    this.openboxService.getTopology()
      .subscribe(this.onTopologyUpdated.bind(this));

    this.topologySubscription = this.openboxService.subscribeToTopologyUpdates(this.onTopologyUpdated.bind(this));
  }

  onTopologyUpdated(topologyGraph: { nodes: any[], links: any[] }) {
    this.topologyGraph = topologyGraph;
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

  ngOnDestroy() {
    this.topologySubscription.unsubscribe();
  }

  onLegendLabelClick(clicked) {
    console.log(clicked);
  }
}
