import {EventEmitter, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Block} from '../model/block';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class OpenboxService {
  private stompClient;
  private openBoxMessageBus = new Subject();
  private events = [];

  private blocks: Block[];

  private mockUrl = 'assets/mocks/';
  private serverUrl = 'http://localhost:3631/';
  private webSocketUrl =  'http://localhost:8080/socket';

  private useMock = false;

  base = this.useMock ? this.mockUrl : this.serverUrl;
  topologyUrl = this.base + 'topology.json';
  appsUrl = this.base + 'apps.json';
  numAppsUrl = this.base + 'numApps';
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

    const socket = new SockJS(`${this.webSocketUrl}`);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, (frame) => {
      // setConnected(true);
      console.log('Connected: ' + frame);
      this.stompClient.subscribe('/topic/greetings', function (greeting) {
        // showGreeting(JSON.parse(greeting.body).content);
        console.log(JSON.parse(greeting.body).content);
      });

      this.stompClient.subscribe('/topic/messages', (message) => this.onNewMessage(JSON.parse(message.body)));

      const data = JSON.stringify({
        'name' : 'OpenBox Dashboard'
      });
      this.stompClient.send('/app/hello', {}, data);
    });
  }

  get onControllerConnect(): EventEmitter<{ online }> {
    return this._onControllerConnectionSubscribers;
  }

  onNewMessage(e) {
    let next = this.events.reverse();

    if (e.message.type === 'Alert') {
      e.dpid = e.message.origin_dpid;
    }

    e.message.handle = e.message.readHandle || e.message.writeHandle;
    next.push(e);
    next = next.reverse().slice(0, 5);
    this.events = next;

    this.openBoxMessageBus.next(this.events);
  }

  getTopology() {
    return this.http.get(this.topologyUrl);
  }

  getApps() {
    return this.http.get(this.appsUrl);
  }

  getNumApps() {
    return this.http.get(this.numAppsUrl);
  }

  getAggregated() {
    return this.http.get(this.aggregatedUrl);
  }

  getOBI(dpid) {
    return this.http.get(`${this.obiUrl}?dpid=${dpid}`);
  }

  getSouthboundLog() {
    if (this.events.length === 0) {
      this.http.get(this.logsUrl).subscribe((messages: [{}]) => messages.forEach(this.onNewMessage.bind(this)));
    } else {
      setTimeout(() => this.openBoxMessageBus.next(this.events), 0);
    }
    return this.openBoxMessageBus;
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
