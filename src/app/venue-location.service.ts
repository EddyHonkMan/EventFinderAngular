import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VenueLocationService {
  mapOptions: google.maps.MapOptions = {
    center: {lat: 0, lng: 0},
    zoom: 14
  };

  marker = {
    position: {lat: 0, lng: 0}
  }
  constructor() { }

  getPosition(venueDetails: any) {
    this.mapOptions = {
      center: {lat: Number(venueDetails?.location?.latitude || 0), lng: Number(venueDetails?.location?.longitude || 0)},
      zoom: 14
    }
    this.marker = {
      position: {lat: Number(venueDetails?.location?.latitude || 0), lng: Number(venueDetails?.location?.longitude || 0)}
    }
    // this.mapOptions.center = {lat: Number(venueDetails?.location?.latitude || 0), lng: Number(venueDetails?.location?.longitude || 0)};
    // this.marker.position = {lat: Number(venueDetails?.location?.latitude || 0), lng: Number(venueDetails?.location?.longitude || 0)};
  }
}
