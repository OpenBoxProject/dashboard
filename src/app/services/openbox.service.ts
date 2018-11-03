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
  private performance = [];
  private alerts = [];
  private blocks: Block[];


  private _onControllerConnectionSubscribers: EventEmitter<{ online }> = new EventEmitter();

  private useMock = false;

  private mockUrl = 'assets/mocks/';
  private serverUrl;
  private webSocketUrl;
  controllerHost: string;

  private baseUrl: string;
  private topologyUrl: string;
  private appsUrl: string;
  private numAppsUrl: string;
  private aggregatedUrl: string;
  private obiUrl: string;
  private activityUrl: string;
  private performanceUrl: string;
  private alertsUrl: string;
  private messageRequestUrl: string;
  private blocksUrl: string;
  private uploadApplicationUrl: string;
  private listRepositoryApplicationsUrl: string;
  private deployApplicationsUrl: string;

  private DEFAULT_CONTROLLER_HOST = 'http://dashboard.openboxproject.org';
  private CONTROLLER_HOST_KEY_NAME = 'openbox.controllerhost';
  private MAX_QUEUE_SIZE = 300;


  constructor(private http: HttpClient) {
    this.initializeEndpoints();

    this.http.get(`${this.blocksUrl}`).subscribe((blocks: Block[]) => this.blocks = blocks);
    this.http.get(this.activityUrl).subscribe((messages: [{}]) => messages.forEach(this.onActivityMessage.bind(this)));
    this.http.get(this.performanceUrl).subscribe((messages: [{}]) => messages.forEach(this.onPerformanceMessage.bind(this)));
    this.http.get(this.alertsUrl).subscribe((messages: [{}]) => messages.forEach(this.onAlertMessage.bind(this)));

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

        this.stompClient.subscribe('/topic/performance', (message) => this.onPerformanceMessage(JSON.parse(message.body)));
        this.stompClient.subscribe('/topic/messages', (message) => this.onActivityMessage(JSON.parse(message.body)));
        this.stompClient.subscribe('/topic/alerts', (message) => this.onAlertMessage(JSON.parse(message.body)));
        this.stompClient.subscribe('/topic/topology', this.onTopologyUpdated.bind(this));

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

  onActivityMessage(e) {
    e.message.handle = e.message.readHandle || e.message.writeHandle;
    this.addElementToLimitedQueue(this.messages, e);
    this.openBoxMessageBus.next(this.messages);
  }

  onPerformanceMessage(e) {
    this.addElementToLimitedQueue(this.performance, e);
    this.openBoxGlobalStatsBus.next(e);
  }

  onAlertMessage(e) {
    e.dpid = e.message.origin_dpid;
    this.addElementToLimitedQueue(this.alerts, e);
    this.openBoxAlertsBus.next(e);
  }

  private addElementToLimitedQueue(arr, el) {
    arr.push(el);
    if (arr.length > this.MAX_QUEUE_SIZE) {
      arr.splice(arr.length - 1, 1);
    }
  }

  private colorTopologyGraph(topology) {
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
    const newGlobalStatsBus = new Subject();
    setTimeout(() => this.performance.forEach(msg => newGlobalStatsBus.next(msg)), 0);
    const sub = this.openBoxGlobalStatsBus.subscribe(msg => { newGlobalStatsBus.next(msg); });

    return newGlobalStatsBus.subscribe(cb).add(() => {
      sub.unsubscribe();
    });

  }

  subscribeToSouthboundMessagesUpdates(cb) {
    setTimeout(() => this.openBoxMessageBus.next(this.messages), 0);
    return this.openBoxMessageBus.subscribe(cb);
  }

  subscribeToAlerts(cb) {
    setTimeout(() => this.openBoxAlertsBus.next(this.alerts), 0);
    return this.openBoxAlertsBus.subscribe(cb);
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
    const hostUrl = window.prompt('Enter Controller Host with protocol', 'http://localhost');
    if (hostUrl && hostUrl.match(/https?:\/\/\w+/)) {
      localStorage.setItem(this.CONTROLLER_HOST_KEY_NAME, hostUrl);
      window.alert('MoonLight Controller hostname was updated to ' + hostUrl);
      window.location.reload();
    } else {
      window.alert('Invalid Host Url. Host url must be of the form https?://<HOSTNAME>');
    }
  }

  uploadApplication(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.uploadApplicationUrl, formData);
  }

  getRepositoryApplications() {
    return this.http.get(this.listRepositoryApplicationsUrl);
  }

  deployApplications(applications: string[]) {
    return this.http.post(this.deployApplicationsUrl, applications);
  }

  private initializeEndpoints() {

    let controllerHost = this.DEFAULT_CONTROLLER_HOST;

    const storedControllerValue = localStorage.getItem(this.CONTROLLER_HOST_KEY_NAME);
    if (storedControllerValue) {
      controllerHost = storedControllerValue;
    }
    this.controllerHost = controllerHost;
    this.mockUrl = 'assets/mocks/';
    this.serverUrl = `${controllerHost}:3635/`;
    this.webSocketUrl = `${controllerHost}:8080/socket`;

    this.baseUrl = this.useMock ? this.mockUrl : this.serverUrl;
    this.topologyUrl = this.baseUrl + 'topology.json';
    this.appsUrl = this.baseUrl + 'apps.json';
    this.numAppsUrl = this.baseUrl + 'numApps';
    this.aggregatedUrl = this.baseUrl + 'aggregated.json';
    this.obiUrl = this.baseUrl + 'obi.json';
    this.activityUrl = this.baseUrl + 'activity.json';
    this.performanceUrl = this.baseUrl + 'performance.json';
    this.alertsUrl = this.baseUrl + 'alerts.json';
    this.messageRequestUrl = this.baseUrl + 'message';
    this.blocksUrl = 'assets/blocks.json';

    this.uploadApplicationUrl =  this.baseUrl + 'uploadApplication';
    this.listRepositoryApplicationsUrl =  this.baseUrl + 'listRepositoryApps';
    this.deployApplicationsUrl =  this.baseUrl + 'deployApplications';
  }

}
