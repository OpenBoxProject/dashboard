import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { OpenboxService } from '../openbox.service';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import {GraphsComponent} from "../graphs/graphs.component";

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {
  selected: { dpid, json, blockId};
  apps: { name, statements, processingGraph: {nodes: any[], links: any[] }}[] = [];
  aggregated: { location, processingGraph: {nodes: any[], links: any[] }}[] = [];

  constructor(private openboxService: OpenboxService,
              public scrollToService: ScrollToService) { }

  ngOnInit() {
    this.openboxService.getApps()
      .subscribe(this.mapApps.bind(this));

    this.openboxService.getAggregated()
      .subscribe(this.mapAggregated.bind(this));
  }

  private mapApps(data: [any]) {
    return data.map((app) => {
      app.statements = app.statements.map((s) => {
        s.processingGraph = GraphsComponent.toGraph(s.processingGraph);
        return s;
      });
      this.apps.push(app);
      return app;
    });
  }

  private mapAggregated(data: [any]) {
    return data.map((location) => {
      location.processingGraph = GraphsComponent.toGraph(location.processingGraph);
      this.aggregated.push(location);
      return location;
    });
  }

  onSelect(node, dpid) {
    console.log('Item clicked', node);
    this.selected = {
      json: JSON.stringify(node.originalBlock, null, 2),
      blockId: node.label,
      dpid: dpid
    };

    const config: ScrollToConfigOptions = {
      target: 'selectedView'
    };

    this.scrollToService.scrollTo(config);
  }

 scrollTo(target) {
    const config: ScrollToConfigOptions = {
      target: target
    };

    this.scrollToService.scrollTo(config);
  }


  sendReadRequest(dpid, blockId) {
    console.log(`sending read request to ${dpid}/${blockId}`);
    this.openboxService.sendReadRequest(dpid, blockId)
      .subscribe((data: { xid }) => {
        console.log(data);
      });
  }

}
