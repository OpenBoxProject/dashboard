import { Component, OnInit } from '@angular/core';
import { OpenboxService } from '../services/openbox.service';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.css']
})
export class DeployComponent implements OnInit {
  selectedApplications: string[] = [];
  repositoryApplications = [];
  deployedApplications = [];

  constructor(private openboxService: OpenboxService) {
  }

  ngOnInit() {
   this.getAppsInformation();
  }

  deploy() {
    console.log('Deploy clicked', this.selectedApplications);
    this.openboxService.deployApplications(this.selectedApplications).subscribe(() => {
        alert('Success!');
        this.getAppsInformation();
      }
    );
  }

  onApplicationUploadedSuccess() {
    alert('Success!');
    this.getAppsInformation();
  }

  getAppsInformation() {
    this.openboxService.getRepositoryApplications().subscribe((apps: {jarName: string, deployed: boolean}[]) => {
      this.repositoryApplications = apps
      this.selectedApplications = apps.filter((app)=>app.deployed).map((app)=>app.jarName);
    });
    
    this.openboxService.getApps().subscribe((apps: {name: string, jarName: string}[]) => this.deployedApplications = apps.map((app) => {return {name: app.name, jarName: app.jarName}}));
  }

  onChange(app: {jarName: string, deployed: boolean}, isChecked: boolean) {
    if (isChecked) {
      this.selectedApplications.push(app.jarName);
    } else {
      const index = this.selectedApplications.indexOf(app.jarName);
      this.selectedApplications.splice(index, 1);
    }

    this.selectedApplications = this.selectedApplications.map((_app) => _app);

  }

}
