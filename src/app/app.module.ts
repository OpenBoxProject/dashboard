import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GraphsComponent } from './graphs/graphs.component';
import { OpenboxService } from './openbox.service';
import { AppsComponent } from './apps/apps.component';
import { NetworkComponent } from './network/network.component';
import { RouterModule, Routes } from '@angular/router';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { SouthboundLogComponent } from './southbound-log/southbound-log.component';
const routes: Routes = [
  { path: '', redirectTo: '/network', pathMatch: 'full' },
  { path: 'network', component: NetworkComponent },
  { path: 'apps', component: AppsComponent },
  { path: 'activity', component: SouthboundLogComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    GraphsComponent,
    AppsComponent,
    NetworkComponent,
    SouthboundLogComponent
  ],
  imports: [
    NgxGraphModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    RouterModule.forRoot(routes),
    ScrollToModule.forRoot()
  ],
  providers: [ OpenboxService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
