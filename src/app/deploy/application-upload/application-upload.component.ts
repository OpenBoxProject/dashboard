import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { OpenboxService } from '../../services/openbox.service';

@Component({
  selector: 'app-application-upload',
  templateUrl: './application-upload.component.html',
  styleUrls: ['./application-upload.component.css']
})
export class ApplicationUploadComponent implements OnInit {

  @Output() applicationUploaded = new EventEmitter();;
  selectedFile;

  constructor(private openBoxService: OpenboxService) { }

  ngOnInit() {
  }

  onUpload() {
    console.log('Upload Clicked', this.selectedFile);
    this.openBoxService.uploadApplication(this.selectedFile).subscribe(resp => {
      this.applicationUploaded.emit(this.selectedFile.name);
    });
  }

  onChange(file) {
    this.selectedFile = file;
    console.log(this.selectedFile);
  }

}
