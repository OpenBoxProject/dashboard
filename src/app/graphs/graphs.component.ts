import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import { colorSets } from '../../../node_modules/@swimlane/ngx-graph/src/utils/color-sets';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css']
})
export class GraphsComponent implements OnInit {

  @Input() graph:  { links: any[], nodes: any[] };
  @Input() orientation = 'LR';

  @Input() width = 1500;
  @Input() height = 500;

  @Output('onLegendLabelClick') $onLegendLabelClick = new EventEmitter();
  @Output('onSelect') $onSelect = new EventEmitter();

  view: any[];
  showLegend = false;
  colorScheme = colorSets.find(s => s.name === 'vivid');
  curve = shape.curveStepBefore;

  // fitContainer: boolean = true;
  // autoZoom: boolean = false;

  static toGraph(graph) {
    const nodes = graph.blocks.map((b) => {
      return {
        id: b.id.replace(/[^\w]+/g, '_'),
        label: `${b.id}`,
        originalBlock: b
      };
    });

    const uniqueLinks = {};
    graph.connectors.forEach((l) => {
      l.sourceId = l.sourceId.replace(/[^\w]+/g, '_');
      l.destinationId = l.destinationId.replace(/[^\w]+/g, '_');
      const linkKey = `${l.sourceId}_ ${l.destinationId}`;
      const link = uniqueLinks[linkKey];
      if (!link) {
        uniqueLinks[linkKey] = {
          source: l.sourceId,
          target: l.destinationId,
          label: `port ${l.sourcePort}`,
          numPorts: 1
        };
      } else {
        link.numPorts++;
        link.label = `${link.numPorts} ports`;
        uniqueLinks[linkKey] = link;
      }

    });
    const links = Object.keys(uniqueLinks).map(e => uniqueLinks[e]);
    return {nodes, links};
  }

  ngOnInit() {
    this.view = [this.width, this.height];
  }

  onLegendLabelClick(data) {
    console.log('legend label clicked', data);
    this.$onLegendLabelClick.emit(data);
  }

  select(data) {
    console.log('Item clicked', data);
    this.$onSelect.emit(data);
  }

}
