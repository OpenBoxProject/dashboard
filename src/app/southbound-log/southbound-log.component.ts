import { Component, OnInit } from '@angular/core';
import { OpenboxService } from '../openbox.service';
import {ScrollToConfigOptions, ScrollToService} from "@nicky-lenaers/ngx-scroll-to";

@Component({
  selector: 'app-southbound-log',
  templateUrl: './southbound-log.component.html',
  styleUrls: ['./southbound-log.component.css']
})
export class SouthboundLogComponent implements OnInit {
  events: { time, direction, message: { xid, blockId, type, dpid?, sourceAddr }}[];
  selected = null;

  constructor(private openboxService: OpenboxService,
              public scrollToService: ScrollToService) { }

  ngOnInit() {
    this.update();
  }

  onSelect(event) {
    this.selected = JSON.stringify(event, null, 2);

    const config: ScrollToConfigOptions = {
      target: 'resultsView'
    };

    this.scrollToService.scrollTo(config);
  }

  update() {
    this.openboxService.getSouthboundLog()
      .subscribe((data:  { time, direction, message: { xid, blockId, type, dpid?, origin_dpid?, messages?, sourceAddr }}[]) => {
        this.events = data.map((e) => {
          if (e.message.type === 'Alert') {
            e.message.dpid = e.message.origin_dpid;
            e.message.blockId = e.message.messages[0].origin_block;
          }
          return e;
        }).reverse();
      });
  }
}
