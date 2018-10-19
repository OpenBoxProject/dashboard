import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Block} from '../model/block';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Subject} from 'rxjs/Subject';
import {map} from 'rxjs/operators';

@Injectable()
export class OpenboxService {
  private stompClient;
  private openBoxMessageBus = new Subject();
  private openBoxAlertsBus = new Subject();
  private openBoxTopologyBus = new Subject();
  private openBoxGlobalStatsBus = new Subject();
  private messages = [];
  private blocks: Block[];


  private _onControllerConnectionSubscribers: EventEmitter<{ online }> = new EventEmitter();

  private useMock = false;

  private mockUrl = 'assets/mocks/';
  private serverUrl;
  private webSocketUrl;

  baseUrl: string;
  private topologyUrl: string;
  private appsUrl: string;
  private numAppsUrl: string;
  private aggregatedUrl: string;
  private obiUrl: string;
  private logsUrl: string;
  private messageRequestUrl: string;
  private blocksUrl: string;

  private DEFAULT_CONTROLLER_HOST = 'http://localhost';
  private CONTROLLER_HOST_KEY_NAME = 'openbox.controllerhost';


  constructor(private http: HttpClient) {
    this.initializeEndpoints();

    this.http.get(`${this.blocksUrl}`).subscribe((blocks: Block[]) => this.blocks = blocks);
    this.http.get(this.logsUrl).subscribe((messages: [{}]) => messages.forEach(this.onNewMessage.bind(this)));

    setTimeout(() => this.initializeWebSocket());
  }

  private initializeWebSocket() {

    let notifyControllerDownTimeout;

    const socket = new SockJS(`${this.webSocketUrl}`);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, (frame) => { // on success
        console.log('Connected: ' + frame);
        if (notifyControllerDownTimeout) {
          clearTimeout(notifyControllerDownTimeout);
        }

        this._onControllerConnectionSubscribers.next({online: true});
        this.stompClient.subscribe('/topic/greetings', function (greeting) {
          // showGreeting(JSON.parse(greeting.body).content);
          console.log(JSON.parse(greeting.body).content);
        });

        this.stompClient.subscribe('/topic/messages', (message) => {
          const e = JSON.parse(message.body);
          if (e.message.type === 'GlobalStatsResponse') {
            this.openBoxGlobalStatsBus.next(e);
          }
        });
        this.stompClient.subscribe('/topic/messages', (message) => this.onNewMessage(JSON.parse(message.body)));
        this.stompClient.subscribe('/topic/topology', this.onTopologyUpdated.bind(this));

        const data = JSON.stringify({
          'name': 'OpenBox Dashboard'
        });
        this.stompClient.send('/app/hello', {}, data);
      },
      (e) => { // on failure
        console.error('Stomp Failure. Re-connecting...', e);

        if (notifyControllerDownTimeout) {
          clearTimeout(notifyControllerDownTimeout);
          notifyControllerDownTimeout = null;
        }

        notifyControllerDownTimeout = setTimeout(() => this._onControllerConnectionSubscribers.next({online: false}), 5000);
        setTimeout(this.initializeWebSocket.bind(this), 5000);
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
    }

    e.message.handle = e.message.readHandle || e.message.writeHandle;
    next.push(e);
    next = next.reverse().slice(0, 100);
    this.messages = next;

    this.openBoxMessageBus.next(this.messages);
  }

  colorTopologyGraph(topology) {
    topology.nodes = topology.nodes.map((n) => {
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
    return topology;
  }

  onTopologyUpdated(message) {
    const topologyGraph = this.colorTopologyGraph(JSON.parse(message.body));
    this.openBoxTopologyBus.next(topologyGraph);
  }

  subscribeToTopologyUpdates(cb) {
    return this.openBoxTopologyBus.subscribe(cb);
  }

  getTopology() {
    return this.http.get(this.topologyUrl).pipe(map(this.colorTopologyGraph));
  }

  subscribeToGlobalStatsUpdates(cb) {
    const openBoxGlobalStatsBus = new Subject();
    setTimeout(() => this.messages.filter((m) => m.message.type === 'GlobalStatsResponse').reverse().forEach(msg => openBoxGlobalStatsBus.next(msg)), 0);
    const sub = this.openBoxGlobalStatsBus.subscribe(msg => {
      openBoxGlobalStatsBus.next(msg);
    });

    return openBoxGlobalStatsBus.subscribe(cb).add(() => {
      sub.unsubscribe();
    });

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

  updateControllerHost() {
    const hostUrl = window.prompt('Enter Controller Host with protocol""', 'http://localhost')
    if (hostUrl && hostUrl.match(/https?:\/\/\w+/)) {
      localStorage.setItem(this.CONTROLLER_HOST_KEY_NAME, hostUrl);
      window.alert('MoonLight Controller hostname was updated to ' + hostUrl)
      window.location.reload();
    } else {
      window.alert('Invalid Host Url. Host url must be of the form https?://<HOSTNAME>');
    }
  }

  private initializeEndpoints() {

    let controllerHost = this.DEFAULT_CONTROLLER_HOST;

    const storedControllerValue = localStorage.getItem(this.CONTROLLER_HOST_KEY_NAME);
    if (storedControllerValue) {
      controllerHost = storedControllerValue;
    }

    this.mockUrl = 'assets/mocks/';
    this.serverUrl = `${controllerHost}:3635/`;
    this.webSocketUrl = `${controllerHost}:8080/socket`;

    this.baseUrl = this.useMock ? this.mockUrl : this.serverUrl;
    this.topologyUrl = this.baseUrl + 'topology.json';
    this.appsUrl = this.baseUrl + 'apps.json';
    this.numAppsUrl = this.baseUrl + 'numApps';
    this.aggregatedUrl = this.baseUrl + 'aggregated.json';
    this.obiUrl = this.baseUrl + 'obi.json';
    this.logsUrl = this.baseUrl + 'network/log.json';
    this.messageRequestUrl = this.baseUrl + 'message';
    this.blocksUrl = 'assets/blocks.json';
  }
}
