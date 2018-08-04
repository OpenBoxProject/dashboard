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
  private openBoxAlertsBus = new Subject();
  private openBoxTopologyBus = new Subject();
  private openBoxGlobalStatsBus = new Subject();
  private messages = [];
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
    this.http.get(this.logsUrl).subscribe((messages: [{}]) => messages.forEach(this.onNewMessage.bind(this)));

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
      this.stompClient.subscribe('/topic/topology', this.onTopologyUpdated.bind(this));

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
    let next = this.messages.reverse();

    if (e.message.type === 'Alert') {
      e.dpid = e.message.origin_dpid;
      this.openBoxAlertsBus.next(e);
    } else if (e.message.type === 'GlobalStatsResponse') {
      this.openBoxGlobalStatsBus.next(e);
    }

    e.message.handle = e.message.readHandle || e.message.writeHandle;
    next.push(e);
    next = next.reverse().slice(0, 5);
    this.messages = next;

    this.openBoxMessageBus.next(this.messages);
  }

  onTopologyUpdated(message) {
    const data = JSON.parse(message.body);
    data.nodes = data.nodes.map((n) => {
      const isEndpoint = n.id.startsWith('E');
      const isSegment = n.id.startsWith('S');
      if (isEndpoint) {
        n.color = '#607d8b';
      } else if (isSegment) {
        n.color = 'yellow'; // todo: make active obi green
      } else {
        n.color = '#00d207'; // todo: make active obi green
      }

      n.originalBlock = {id: n.id, label: n.label, properties: n.properties};
      return n;
    });

    const topologyGraph = data;
    this.openBoxTopologyBus.next(topologyGraph);
  }

  subscribeToTopologyUpdates(cb) {
    return this.openBoxTopologyBus.subscribe(cb);
  }

  getTopology() {
    return this.http.get(this.topologyUrl);
  }

  subscribeToGlobalStatsUpdates(cb) {
    return this.openBoxGlobalStatsBus.subscribe(cb);
  }

  subscribeToSouthboundMessagesUpdates(cb) {
    setTimeout(() => this.openBoxMessageBus.next(this.messages), 0);
    return this.openBoxMessageBus.subscribe(cb);
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
