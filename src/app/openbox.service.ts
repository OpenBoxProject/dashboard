import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) { }

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

  sendReadRequest(dpid, blockId) {
    return this.http.post(`${this.readRequestUrl}`, {
      locationSpecifier: dpid,
      blockId: blockId
    });
  }


}
