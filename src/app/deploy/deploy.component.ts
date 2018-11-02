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
    this.getAppsInformation();
  }

  getAppsInformation() {
    this.openboxService.getRepositoryApplications().subscribe((apps: string[]) => this.repositoryApplications = apps);
    this.openboxService.getApps().subscribe((apps: {name: string}[]) => this.deployedApplications = apps.map((app) => app.name));
  }

  onChange(app: string, isChecked: boolean) {
    if (isChecked) {
      this.selectedApplications.push(app);
    } else {
      const index = this.selectedApplications.indexOf(app);
      this.selectedApplications.splice(index, 1);
    }

    this.selectedApplications = this.selectedApplications.map((_app) => _app);

  }

}
