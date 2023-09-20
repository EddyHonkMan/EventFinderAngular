import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {Location} from "@angular/common";

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { EventSearchFormComponent } from './event-search-form/event-search-form.component';
import { ResultTableComponent } from './result-table/result-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {GoogleMapsModule} from "@angular/google-maps";

import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTabsModule} from "@angular/material/tabs";
import { EventDetailComponent } from './event-detail/event-detail.component';
import { GoogleMapModalComponent } from './google-map-modal/google-map-modal.component';
import { ExpandableTextComponent } from './expandable-text/expandable-text.component';
import { FavoritesComponent } from './favorites/favorites.component';

@NgModule({
  declarations: [
    AppComponent,
    EventSearchFormComponent,
    ResultTableComponent,
    EventDetailComponent,
    GoogleMapModalComponent,
    ExpandableTextComponent,
    FavoritesComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        GoogleMapsModule
    ],
  providers: [Location],
  bootstrap: [AppComponent]
})
export class AppModule { }
