import {Component, Input, OnChanges, OnInit} from '@angular/core';
import { OpenboxService } from '../services/openbox.service';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';

@Component({
  selector: 'app-southbound-log',
  templateUrl: './southbound-log.component.html',
  styleUrls: ['./southbound-log.component.css']
})
export class SouthboundLogComponent implements OnInit, OnChanges {
  events: { time, direction, message: { xid, blockId, type, dpid?, sourceAddr, handle? }}[];
  selected = null;

  @Input() xid;
  @Input() compact = false;
  @Input() refresh = true;

  constructor(private openboxService: OpenboxService,
              public scrollToService: ScrollToService) { }

  ngOnInit() {
    this.update();
    if (this.refresh) {
      setInterval(this.update.bind(this), 5000);
    }
  }

  onSelect(event) {
    this.selected = JSON.stringify(event, null, 2);

    const config: ScrollToConfigOptions = {
      target: 'sl-eventDetailsView'
    };

    // this.scrollToService.scrollTo(config);
  }

  update() {
    this.openboxService.getSouthboundLog()
      .subscribe((data:  { time, dpid?, direction, message: {
        xid, blockId, type, origin_dpid?, messages?, sourceAddr,
        handle?, readHandle?, writeHandle?
      }}[]) => {
        if (this.xid) {
          data = data.filter((e) => e.message.xid === this.xid);
        }

        this.events = data.map((e) => {
          if (e.message.type === 'Alert') {
            e.dpid = e.message.origin_dpid;
          }

          e.message.handle = e.message.readHandle || e.message.writeHandle;
          return e;
        }).reverse().slice(0, 5);
      });
  }

  getMessageClassName(type) {
    switch (type) {
      case 'Alert': return 'badge-danger';
      case 'WriteRequest': return  'badge-primary';
      default: return 'badge-success';
    }
  }

  ngOnChanges() {
    this.selected = null;
    this.update();
  }
}
