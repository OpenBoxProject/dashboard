import {Component, Input, OnInit, OnChanges} from '@angular/core';
import {OpenboxService} from '../../services/openbox.service';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.css']
})
export class BlockComponent implements OnInit, OnChanges {

  @Input() dpid;
  @Input() block;
  handle;
  requestType: string;

  constructor(private openboxService: OpenboxService) { }

  ngOnInit() {
  }

  sendWriteRequest(handle) {
    this.handle = this.block.config.write_handlers.filter((h) => h.name === handle)[0];
    this.requestType = 'write';
  }

  sendReadRequest(handle) {
    this.handle = this.block.config.read_handlers.filter((h) => h.name === handle)[0];
    this.requestType = 'read';
  }

  ngOnChanges() {
    this.handle = null;
  }
}
