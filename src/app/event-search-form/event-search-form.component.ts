import {Component, OnInit} from '@angular/core';
import {FormControl, NgForm} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {TableItem} from "../TableItem";
import {first, firstValueFrom, throwError, debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter} from "rxjs";
import {catchError} from "rxjs";

@Component({
  selector: 'app-event-search-form',
  templateUrl: './event-search-form.component.html',
  styleUrls: ['./event-search-form.component.css']
})

export class EventSearchFormComponent implements OnInit{

  segmentIDs: any = {
    'Music': 'KZFzniwnSyZfZ7v7nJ',
    'Sports': 'KZFzniwnSyZfZ7v7nE',
    'Arts & Theatre': 'KZFzniwnSyZfZ7v7na',
    'Film': 'KZFzniwnSyZfZ7v7nn',
    'Miscellaneous': 'KZFzniwnSyZfZ7v7n1',
    'Default': ''
  }
  categories: string[] = ['Default', 'Music', 'Sports', 'Arts & Theatre', 'Film', 'Miscellaneous']
  distancePlaceHolder: number = 10
  keyword: string = '';
  distance?: number;
  category: string = 'Default'
  location: string = '';
  autodetect: boolean = false;
  table?: TableItem[]
  submitted: boolean = false;
  geoInfo?: string
  autocompleteOptions: string[] = []
  isLoading: boolean = false;
  keywordControl = new FormControl()
  selectedEvent ?: TableItem

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.keywordControl.valueChanges
      .pipe(
        filter(value => {
          if (!value || value.trim().length == 0) {
            this.autocompleteOptions = []
            return false;
          }
          return true
        }),
        distinctUntilChanged(),
        debounceTime(300),
        tap(() => {
          this.autocompleteOptions = []
          this.isLoading = true
        }),
        switchMap(value => this.http.get(`/autocomplete?keyword=${value}`)
          .pipe(
            finalize(() => {
              this.isLoading = false
            })
          )
        )
      )
      .subscribe((data:any) => {
        if (data._embedded?.attractions && data._embedded.attractions.length != 0) {
          for(let attraction of data._embedded.attractions) {
            this.autocompleteOptions.push(attraction.name)
          }
        }
        else{
          this.autocompleteOptions = []
        }
      })

  }

  eventSearch() {
    const url = `/events_search?keyword=${this.keyword}&distance=${this.distance ? this.distance : this.distancePlaceHolder}&segmentId=${this.segmentIDs[this.category]}&location=${this.autodetect? this.geoInfo : this.location}${this.autodetect ? '&autodetect=on' : ''}`.replace(/\s+/g, '+');
    console.log(url);
    this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error occurred during request:', error);
        return throwError(error);
      })
    ).subscribe(
      data => {
        try {
          this.table = []
          if (Object.keys(data).length === 0 || data._embedded?.page?.totalElements) return;
          for(let e of data._embedded?.events) {
            this.table.push({
              dateTime: e.dates?.start?.dateTime ? new Date(e.dates.start.dateTime) : undefined,
              date : e.dates?.start?.localDate,
              time : e.dates?.start?.localTime,
              icon : e.images?.[0]?.url,
              eventName : e.name,
              eventID : e.id,
              genre : e.classifications?.[0]?.segment?.name,
              venue : e._embedded?.venues?.[0]?.name
            });
          }
          this.table.sort((a, b) => {
            if (a.dateTime && b.dateTime) {
              return a.dateTime.getTime() - b.dateTime.getTime();
            }
            return (a.date || '').localeCompare(b.date || '')
          })
          // console.log(data);
        } catch (error) {
          console.error('Error occurred within the next function:', error);
        }
      }
    );
  }

  onSubmit(searchForm: NgForm) {
    if (!searchForm.valid) return;
    this.submitted = false
    this.selectedEvent = undefined
    if (this.autodetect) {
      const url = "https://ipinfo.io/json?token=a065591e973c9f"
      this.http.get<any>(url).pipe(
        catchError(error => {
          console.error('Error occurred during request:', error);
          return throwError(error);
        })
      ).subscribe( data => {
          if (Object.keys(data).length === 0 || !data.loc) return;
          this.geoInfo = data.loc
          this.eventSearch()
        }
      )
    }
    else {
      this.eventSearch()
    }
    this.submitted = true;
  }

  onClear() {
    this.submitted = false;
    this.table = undefined
    this.keyword = ''
    this.distance = undefined
    this.category = 'Default'
    this.location = ''
    this.autodetect = false
    this.geoInfo = undefined
    this.selectedEvent = undefined
  }
}
