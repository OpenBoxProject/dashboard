import { Component, OnInit } from '@angular/core';
import { OpenboxService } from '../../services/openbox.service';

@Component({
  selector: 'app-application-upload',
  templateUrl: './application-upload.component.html',
  styleUrls: ['./application-upload.component.css']
})
export class ApplicationUploadComponent implements OnInit {

  selectedFile;

  constructor(private openBoxService: OpenboxService) { }

  ngOnInit() {
  }

  onUpload() {
    console.log('Upload Clicked', this.selectedFile);
    this.openBoxService.uploadApplication(this.selectedFile).subscribe(resp => {
      window.alert('Success! Reloading...');
      window.location.reload();
    });
  }

  onChange(file) {
    this.selectedFile = file;
    console.log(this.selectedFile);
  }

}
