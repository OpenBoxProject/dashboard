import {EventEmitter, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Block} from '../model/block';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class OpenboxService {
  private socket;
  private socketObservable: Observable<{}>;

  private blocks: Block[];

  private mockUrl = 'assets/mocks/';
  private serverUrl = 'http://localhost:3631/';
  private webSocketUrl =  'http://localhost:3631/';

  private useMock = false;

  private base = this.useMock ? this.mockUrl : this.serverUrl;
  topologyUrl = this.base + 'topology.json';
  appsUrl = this.base + 'apps.json';
  aggregatedUrl = this.base + 'aggregated.json';
  obiUrl = this.base + 'obi.json';
  logsUrl = this.base + 'network/log.json';
  messageRequestUrl = this.base + 'message';
  blocksUrl =  'assets/blocks.json';

  private _onControllerConnectionSubscribers: EventEmitter<{ online }> = new EventEmitter();


  constructor(private http: HttpClient) {
    this.http.get(`${this.blocksUrl}`).subscribe((blocks: Block[]) => this.blocks = blocks);
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.socketObservable = new Observable(observer => {

      this.socket = io.connect(this.webSocketUrl);

      this.socket.on('message', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };

    });
  }

  get onControllerConnect(): EventEmitter<{ online }> {
    return this._onControllerConnectionSubscribers;
  }


  getTopology() {
    return this.http.get(this.topologyUrl);
  }

  getApps() {
    return this.http.get(this.appsUrl);
  }

  getAggregated() {
    return this.http.get(this.aggregatedUrl);
  }

  getOBI(dpid) {
    return this.http.get(`${this.obiUrl}?dpid=${dpid}`);
  }

  getSouthboundLog() {
    return this.http.get(`${this.logsUrl}`);
  }

  getBlock(type) {
    try {
      return this.blocks.filter((block: Block) => block.type === type)[0];
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  sendReadRequest(dpid, blockId, handle) {
      return this.http.post(`${this.messageRequestUrl}`, {
        locationSpecifier: dpid,
        type: 'read',
        blockId: blockId,
        handle: handle
      });
  }

  sendWriteRequest(dpid, blockId, handle, value) {

      return this.http.post(`${this.messageRequestUrl}`, {
        locationSpecifier: dpid,
        type: 'write',
        blockId: blockId,
        handle: handle,
        value: value
      });
  }
}
