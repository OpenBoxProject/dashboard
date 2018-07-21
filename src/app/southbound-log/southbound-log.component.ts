import {Component, Input, OnChanges, OnInit, OnDestroy} from '@angular/core';
import {OpenboxService} from '../services/openbox.service';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-southbound-log',
  templateUrl: './southbound-log.component.html',
  styleUrls: ['./southbound-log.component.css']
})
export class SouthboundLogComponent implements OnInit, OnChanges, OnDestroy {
  filteredMessages: any;
  messages: { time, direction, message: { xid, blockId, type, dpid?, sourceAddr, handle? } }[] = [];

  selected = null;

  @Input() xid;
  @Input() compact = false;
  @Input() refresh = true;
  private subscription: Subscription;

  constructor(private openboxService: OpenboxService) {
  }

  ngOnInit() {
    this.subscribe();
  }

  onSelect(event) {
    this.selected = JSON.stringify(event, null, 2);
  }

  subscribe() {
    this.subscription = this.openboxService.getSouthboundLog()
      .subscribe((data: {
          time, dpid?, direction, message: {
            xid, blockId, type, origin_dpid?, messages?, sourceAddr,
            handle?, readHandle?, writeHandle?
          }
        }[]) => {
          this.updateData(data);
        }
      );
  }

  updateData(messages): any {

    this.messages = messages;

    if (this.xid) {
      messages = messages.filter((e) => e.message.xid === this.xid);
    }

    this.filteredMessages = messages;
  }

  getMessageClassName(type) {
    switch (type) {
      case 'Alert':
        return 'badge-danger';
      case 'WriteRequest':
        return 'badge-primary';
      default:
        return 'badge-success';
    }
  }

  ngOnChanges() {
    this.selected = null;
    this.updateData(this.messages);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
