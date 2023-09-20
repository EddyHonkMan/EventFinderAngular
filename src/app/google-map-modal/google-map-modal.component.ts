import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {VenueLocationService} from "../venue-location.service";

@Component({
  selector: 'app-google-map-modal',
  templateUrl: './google-map-modal.component.html',
  styleUrls: ['./google-map-modal.component.css']
})
export class GoogleMapModalComponent{

  constructor(public venueLocationService: VenueLocationService) {
  }

}
