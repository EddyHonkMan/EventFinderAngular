import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {TableItem} from "../TableItem";
import {HttpClient} from "@angular/common/http";
import {FavoritesService} from "../favorites.service";
import {VenueLocationService} from "../venue-location.service";

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})

export class EventDetailComponent implements AfterViewInit {
  private MAX_RECURSE_DEPTH = 5
  @Input() item?: TableItem
  @Output() goBackEvent = new EventEmitter()
  date?: string;
  types?: string;
  eventName?: string;
  venueName?: string;
  priceRange?: string;
  status ?: string
  buyTicketUrl ?: string
  seatMapUrl: string = ''
  attractions ?: string
  musicRelated: boolean = false
  artists: string[] = []
  artistsInfo: any[] = []
  artistsAlbums: any[] = []
  ticketStatusMap: Record<string, string> = {
    'On Sale': 'green',
    'Off Sale': 'red',
    'Canceled': 'black',
    'Rescheduled': 'orange',
    'Postponed': 'orange'
  }
  venueDetails ?: any;

  constructor(private http: HttpClient, private favoriteService: FavoritesService, public venueLocationService: VenueLocationService) {
  }

  ngAfterViewInit() {
    //reset data to get rid of possible error
    this.date = undefined
    this.types = undefined
    this.venueName = undefined
    this.priceRange = undefined
    this.status = undefined
    this.buyTicketUrl = undefined
    this.seatMapUrl = ''
    this.attractions = undefined
    this.musicRelated = false
    this.artists = []
    this.artistsInfo = []
    this.artistsAlbums = []
    this.venueDetails = undefined
    //use this function to populate detail card
    this.http.get(`/event_details?id=${this.item?.eventID}`)
      .subscribe(
        (data: any) => {
          this.date = data.dates?.start.localDate
          this.venueName = data._embedded?.venues?.[0]?.name

          this.types = (() => {
            const classifications = ['segment', 'genre', 'subGenre', 'type', 'subType']
            let values = []
            for (const classification of classifications) {
              if (data.classifications?.[0]?.[classification] && data.classifications[0][classification]?.['name'] !== 'Undefined') {
                values.push(data.classifications[0][classification]['name'])
              }
            }
            const res = Array.from(new Set(values)).join(' | ')
            return res || undefined
          })()

          if (data.classifications?.[0]?.segment?.name === 'Music') {
            this.musicRelated = true
          } else if (data._embedded?.attractions?.[0]?.classifications?.[0]?.segment?.name) {
            for (let attraction of data._embedded.attractions) {
              if (attraction.classifications[0].segment.name === 'Music') {
                this.musicRelated = true
                break
              }
            }
          }

          if (data._embedded?.attractions?.[0]?.classifications?.[0]?.segment?.name) {
            for (let attraction of data._embedded.attractions) {
              if (attraction.classifications[0].segment.name === 'Music') {
                this.artists.push(attraction.name)
              }
            }
            this.artists = Array.from(new Set(this.artists))
          }

          if (data.priceRanges?.[0] && data.priceRanges[0].min && data.priceRanges[0].max && data.priceRanges[0].currency) {
            this.priceRange = (data.priceRanges[0].min === data.priceRanges[0].max ? data.priceRanges[0].min : data.priceRanges[0].min + ' - ' + data.priceRanges[0].max) + ' ' + data.priceRanges[0].currency
          }

          if (data.dates?.status?.code) {
            const s = data.dates.status.code
            this.status = (s === 'onsale' ? 'On Sale' : (s === 'offsale' ? 'Off Sale' : s.charAt(0).toUpperCase() + s.slice(1)))
          }

          this.buyTicketUrl = data.url
          this.seatMapUrl = data.seatmap?.staticUrl

          if (data._embedded?.attractions) {
            let values = []
            for (let a of data._embedded.attractions) {
              if (a.name) {
                values.push(a.name)
              }
            }
            this.attractions = Array.from(new Set(values)).join(' | ')
          }

          this.getArtistsInfo()
          setTimeout(() => {
            this.getVenueDetails()
          }, 500)
        }
      )
  }

  goBack() {
    this.goBackEvent.emit(undefined)
  }

  getTwitterShareHref() {
    return 'https://twitter.com/share?text=' + encodeURIComponent('Check ' + (this.item?.eventName + ' ' || '') + 'on Ticketmaster.') + '&url=' + this.buyTicketUrl
  }

  getArtistsInfo() {
    if (this.artists.length != 0) {
      this.getFirstValidArtistInfo()
    }
    else{
      this.musicRelated = false
    }
  }

  //this method aims to get the first valid artist info from the list of artists as quick as possible,
  // rather than waiting for all the requests to finish, which may take a long time and ca
  getFirstValidArtistInfo(index: number = 0) {
    if (index < this.artists.length) {
      this.http.get(`/artists?keyword=${this.artists[index]}`)
        .subscribe((data:any) => {
          if (data && Object.keys(data).length !== 0) {
            this.artistsInfo.push(data);
            this.http.get(`/albums?keyword=${data.id}`)
              .subscribe( (albums:any) => {
                  //always accept the albums' data, even if it's empty
                  this.artistsAlbums.push(albums);
                  this.getRemainingArtistsInfo(index + 1)
              })
          }
          else {
            if (index < this.MAX_RECURSE_DEPTH) {
              this.getFirstValidArtistInfo(index + 1);
            }
            else{
              this.getRemainingArtistsInfo(index + 1)
            }
          }
        })
    }
  }

  //will only be called after getting all the first valid artist info, including albums
  getRemainingArtistsInfo(index: number) {
    const promises = [];
    for (let artist of this.artists.slice(index)) {
      promises.push(this.http.get(`/artists?keyword=${artist}`).toPromise());
    }

    Promise.all(promises)
      .then(results => {
        for (let res of results) {
          if (res && Object.keys(res).length !== 0) {
            this.artistsInfo.push(res);
          }
        }
        //if no artist info can be achieved from spotify, make artist tab show nonMusicRelated
        if (this.artistsInfo.length == 0) {
          this.musicRelated = false
          return
        }

        //get albums for each artist, note not to mess up the order
        for(let i = this.artistsAlbums.length, len = this.artistsInfo.length; i < len; i++) {
          this.http.get(`/albums?keyword=${this.artistsInfo[i].id}`)
            .subscribe( (data:any) => {
              this.artistsAlbums[i] = data;
            })
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  getVenueDetails() {
    this.http.get(`/venue_details?keyword=${this.venueName}`)
      .subscribe((data: any) => {
          this.venueDetails = data?._embedded?.venues?.[0]
        }
      )
  }

  getFormattedAddress(): string {
    const addressParts = [
      this.venueDetails.address.line1,
      this.venueDetails.city?.name,
      this.venueDetails.state?.name,
    ];

    return addressParts
      .filter((val) => val !== undefined)
      .join(', ');
  }

  changeFavoriteStatus() {
    if (this.favoriteService.isFavorited(this.item?.eventID || '')) {
      this.favoriteService.removeFavorite(this.item?.eventID || '')
      alert('Event Removed from Favorites!')
    }
    else {
      this.favoriteService.addFavorite(this.item?.eventID || '', {
        eventName: this.item?.eventName || '',
        venue: this.item?.venue || '',
        date: this.item?.date || '',
        category: this.types || '',
        key: this.item?.eventID || '',
      })
      alert('Event Added to Favorites!')
    }
  }

  isFavorited(): boolean {
    return this.favoriteService.isFavorited(this.item?.eventID || '')
  }

  getTicketStatusButtonClass() {
    return {
      'btn-success': this.status === 'On Sale',
      'btn-danger': this.status === 'Off Sale',
      'btn-warning': this.status === 'Rescheduled' || this.status === 'Postponed',
      'btn-dark': this.status === 'Cancelled'
    }
  }
}
