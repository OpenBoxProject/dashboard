import {Component, Input, OnInit} from '@angular/core';
import {OpenboxService} from '../../../services/openbox.service';

@Component({
  selector: 'app-block-request',
  templateUrl: './block-request.component.html',
  styleUrls: ['./block-request.component.css']
})
export class BlockRequestComponent implements OnInit {

  @Input() dpid;
  @Input() block;
  @Input() handle;
  @Input() type;

  writeValue;
  xid: number;

  constructor(private openboxService: OpenboxService) { }

  ngOnInit() {
  }

  sendRequest() {
    if (this.type === 'read') {
      this.sendReadRequest();
    } else {
      this.sendWriteRequest();
    }
  }

  sendWriteRequest() {
    console.log(`sending '${this.handle.name}' write request with value=${this.writeValue} to ${this.dpid}/${this.block.label}`);
    this.openboxService.sendWriteRequest(this.dpid, this.block.label, this.handle.name, this.writeValue)
      .subscribe((data: { xid }) => {
        this.xid = data.xid;
      });
  }

  sendReadRequest() {
    console.log(`sending '${this.handle.name}' read request with value=${this.writeValue} to ${this.dpid}/${this.block.label}`);
    this.openboxService.sendReadRequest(this.dpid, this.block.label, this.handle.name)
      .subscribe((data: { xid }) => {
        console.log(data);
        this.xid = data.xid;
      });
  }
}
