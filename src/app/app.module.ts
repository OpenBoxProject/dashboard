import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NvD3Module } from 'ng2-nvd3';

import { AppComponent } from './app.component';
import { GraphsComponent } from './graphs/graphs.component';
import { OpenboxService } from './services/openbox.service';
import { OverviewComponent } from './overview/overview.component';
import { AppsComponent } from './apps/apps.component';
import { NetworkComponent } from './network/network.component';
import { RouterModule, Routes } from '@angular/router';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { SouthboundLogComponent } from './southbound-log/southbound-log.component';
import { ObiComponent } from './obi/obi.component';
import { BlockComponent } from './obi/block/block.component';
import { BlockRequestComponent } from './obi/block/block-request/block-request.component';
import { ApplicationUploadComponent } from './deploy/application-upload/application-upload.component';
import { DeployComponent } from './deploy/deploy.component';


const routes: Routes = [
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'apps', component: AppsComponent },
  { path: 'activity', component: SouthboundLogComponent },
  { path: 'alerts', component: SouthboundLogComponent },
  { path: 'deploy', component: DeployComponent },
];

@NgModule({
  declarations: [
    OverviewComponent,
    AppComponent,
    GraphsComponent,
    AppsComponent,
    NetworkComponent,
    SouthboundLogComponent,
    ObiComponent,
    BlockComponent,
    BlockRequestComponent,
    ApplicationUploadComponent,
    DeployComponent
  ],
  imports: [
    NgxGraphModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    RouterModule.forRoot(routes),
    ScrollToModule.forRoot(),
    NvD3Module
  ],
  providers: [ OpenboxService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
