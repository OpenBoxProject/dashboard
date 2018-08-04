import {Component, OnDestroy, OnInit} from '@angular/core';
import {OpenboxService} from '../services/openbox.service';
import {ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {GraphsComponent} from '../graphs/graphs.component';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

  numApps = 0;
  numOBIs = 0;
  serverUrl: string;
  globalStats = {};
  globalStatsArr = [];
  topologyGraph: { nodes: any[], links: any[] };
  topologySubscription: Subscription;
  globalStatsSubscription: Subscription;

  constructor(private openboxService: OpenboxService,
              private scrollToService: ScrollToService) {
    this.serverUrl = openboxService.base;
  }

  ngOnInit() {
    this.openboxService.getTopology()
      .subscribe(this.onTopologyUpdated.bind(this));

    this.topologySubscription = this.openboxService.subscribeToTopologyUpdates(this.onTopologyUpdated.bind(this));
    this.globalStatsSubscription = this.openboxService.subscribeToGlobalStatsUpdates(this.onGlobalStatsUpdated.bind(this));

    this.openboxService.getNumApps().subscribe((numApps: number) => this.numApps = numApps);
  }

  onTopologyUpdated(topologyGraph: { nodes: any[], links: any[] }) {
    this.topologyGraph = topologyGraph;
  }

  onGlobalStatsUpdated(globalStats) {
    this.globalStats[globalStats.dpid] = globalStats;
    this.globalStatsArr = Object.values(this.globalStats).map(v => JSON.stringify(v));
  }

  scrollToDetails() {
    this.scrollToService.scrollTo({
      target: 'selectedView'
    });
  }

  ngOnDestroy() {
    this.topologySubscription.unsubscribe();
    this.globalStatsSubscription.unsubscribe();
  }

}
