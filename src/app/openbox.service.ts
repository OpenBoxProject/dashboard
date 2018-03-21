import {EventEmitter, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {observable} from 'rxjs/symbol/observable';

@Injectable()
export class OpenboxService {

  private mockUrl = 'assets/mocks/';
  private serverUrl = 'http://localhost:3631/';
  private useMock = false;

  private base = this.useMock ? this.mockUrl : this.serverUrl;

  topologyUrl = this.base + 'topology.json';
  appsUrl = this.base + 'apps.json';
  aggregatedUrl = this.base + 'aggregated.json';
  obiUrl = this.base + 'obi.json';
  logsUrl = this.base + 'network/log.json';
  readRequestUrl = this.base + 'message/read';
  private _onControllerConnectionSubscribers: EventEmitter<{ online }> = new EventEmitter();

  constructor(private http: HttpClient) { }

  get onControllerConnect(): EventEmitter<{ online }> {
    return this._onControllerConnectionSubscribers;
  }

  private onControllerStatusChange(online) {
    this._onControllerConnectionSubscribers.emit(online);
  }

  private request(requestObservable) {
    requestObservable.subscribe(() => {
      this.onControllerStatusChange({online: true});
    },
      err => this.onControllerStatusChange({online: false})
  );

    return requestObservable;
  }

  getTopology() {
    return this.request(this.http.get(this.topologyUrl));
  }

  getApps() {
    return this.request(this.http.get(this.appsUrl));
  }

  getAggregated() {
    return this.request(this.http.get(this.aggregatedUrl));
  }

  getOBI(dpid) {
    return this.request(this.http.get(`${this.obiUrl}?dpid=${dpid}`));
  }

  getSouthboundLog() {
    return this.request(this.http.get(`${this.logsUrl}`));
  }

  sendReadRequest(dpid, blockId) {
    return this.request(this.http.post(`${this.readRequestUrl}`, {
      locationSpecifier: dpid,
      blockId: blockId
    }));
  }
}
