import {Component, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {OpenboxService} from '../services/openbox.service';
import {ScrollToService} from '@nicky-lenaers/ngx-scroll-to';

@Component({
  selector: 'app-obi',
  templateUrl: './obi.component.html',
  styleUrls: ['./obi.component.css']
})
export class ObiComponent implements OnInit, OnChanges {

  config: string;
  selected: { json: string; originalBlock: any; label: any; config: {}; };

  @Input() obi;
  globalStats: object[];
  emptyGraphSentToOBI: boolean;

  constructor(private openboxService: OpenboxService,
              private scrollToService: ScrollToService) { }

  ngOnInit() {
    this.ngOnChanges(null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.config = JSON.stringify(this.obi.properties, null, 2);
    this.emptyGraphSentToOBI = this.obi.processingGraph.nodes.length === 0;
    this.selected = null;
  }

  onLegendLabelClick(data) {
    console.log('Item clicked', data);
  }

  onOBIBlockSelect(node) {
    console.log('OBI processing block clicked', node);
    this.selected = {
      json: JSON.stringify(node.originalBlock, null, 2),
      originalBlock: node.originalBlock,
      label: node.label,
      config: this.openboxService.getBlock(node.originalBlock.type)
    };
    console.log('OBI block config', this.selected.config);

    this.scrollToDetails();
  }


  scrollToDetails() {

    this.scrollToService.scrollTo({
      target: 'obiDetailsView'
    });
  }
}
