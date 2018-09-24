import {Component, OnDestroy, OnInit} from '@angular/core';
import {OpenboxService} from '../services/openbox.service';
import {ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {Subscription} from 'rxjs/Subscription';
import {ViewEncapsulation} from '@angular/core';


interface DataSeries {
  key: string;
  values: { x, y }[];
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', '../../../node_modules/nvd3/build/nv.d3.css'],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent implements OnInit, OnDestroy {

  cpuData: DataSeries[];
  memData: DataSeries[];
  alertsData: DataSeries[];

  numApps = 0;
  numOBIs = 0;
  serverUrl: string;
  topologyGraph: { nodes: any[], links: any[] };

  private topologySubscription: Subscription;
  private globalStatsSubscription: Subscription;
  private performanceDataByDpid = {};

  constructor(private openboxService: OpenboxService) {
    this.serverUrl = openboxService.base;

    // this.cpuData = lineDataGeneratorService.generateData();
    // this.memData = lineDataGeneratorService.generateData();
    // this.alertsData = lineDataGeneratorService.generateData();

  }
  cpuOptions = this.getLineChartOptions('CPU');
  memOptions = this.getLineChartOptions('MEM');
  getLineChartOptions(label) {

    const options = {
      chart: {
        type: 'lineWithFocusChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 60,
          left: 40
        },
        duration: 500,
        useInteractiveGuideline: true,
        xAxis: {
          axisLabel: 'Time',
          tickFormat: function(d) {
            return d3.format(',f')(d);
          }
        },
        x2Axis: {
          tickFormat: function(d) {
            return d3.format(',f')(d);
          }
        },
        yAxis: {
          axisLabel: label,
          tickFormat: function(d) {
            return d3.format(',.2f')(d);
          },
          rotateYLabel: false
        },
        y2Axis: {
          tickFormat: function(d) {
            return d3.format(',.2f')(d);
          }
        }

      }
    };
    return options;
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
    this.numOBIs = this.topologyGraph.nodes.filter((node) => node.dpid !== undefined).length;
  }

  onGlobalStatsUpdated(globalStats) {

    const dpid = globalStats.dpid;
    const time = new Date(globalStats.time);
    const stats = globalStats.message.stats;

    const cpuChartData = [];
    const memChartData = [];

    const key = 'OBI' + dpid;
    const cpuValues = this.performanceDataByDpid[dpid] && this.performanceDataByDpid[dpid].cpu || [];
    const memValues = this.performanceDataByDpid[dpid] && this.performanceDataByDpid[dpid].mem || [];

    // {x: 0, y: 0.16613152246719962, series: 2}
    // const obiCpuData = { x: memValues.length === 0 ? 0 : memValues[memValues.length - 1].x + 1 , y: stats.cpu[0] };
    // const obiMemData = { x: memValues.length === 0 ? 0 : memValues[memValues.length - 1].x + 1, y: stats.memory_usage };
    console.log('event time', time);
    const obiCpuData = { x: time , y: stats.cpu[0] }; // todo: take an avg?
    const obiMemData = { x: time, y: stats.memory_usage };

    this.performanceDataByDpid[dpid] = {
      key: key,
      cpu: cpuValues.concat(obiCpuData).slice(-500),
      mem: memValues.concat(obiMemData).slice(-500)
    };

    Object.keys(this.performanceDataByDpid).forEach((_dpid) => {
      cpuChartData.push({key: this.performanceDataByDpid[_dpid].key, values: this.performanceDataByDpid[_dpid].cpu});
      memChartData.push({key: this.performanceDataByDpid[_dpid].key, values: this.performanceDataByDpid[_dpid].mem});
    });

    this.cpuData = cpuChartData;
    this.memData = memChartData;
  }

  ngOnDestroy() {
    this.topologySubscription.unsubscribe();
    this.globalStatsSubscription.unsubscribe();
  }

}
