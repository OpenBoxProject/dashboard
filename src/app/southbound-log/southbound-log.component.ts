import {Component, Input, OnChanges, OnInit, OnDestroy} from '@angular/core';
import {OpenboxService} from '../services/openbox.service';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-southbound-log',
  templateUrl: './southbound-log.component.html',
  styleUrls: ['./southbound-log.component.css']
})
export class SouthboundLogComponent implements OnInit, OnDestroy {
  filteredMessages: any;
  selected = null;

  @Input() xid;
  @Input() compact = false;
  @Input() refresh = true;
  private subscription: Subscription;

  constructor(private openboxService: OpenboxService,
              private router: Router) {
  }

  ngOnInit() {
    this.subscribe(this.router.url);
  }

  onSelect(event) {
    this.selected = JSON.stringify(event, null, 2);
  }

  subscribe(activeRoute) {

    let subMethod;
    if (activeRoute === '/alerts') {
      subMethod = this.openboxService.subscribeToAlerts.bind(this.openboxService);
    } else {
      subMethod = this.openboxService.subscribeToSouthboundMessagesUpdates.bind(this.openboxService);
    }

    this.subscription =  subMethod((data: {
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

    if (this.xid) {
      messages = messages.filter((e) => e.message.xid === this.xid);
    }

    this.filteredMessages = [].concat(messages).reverse();
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
