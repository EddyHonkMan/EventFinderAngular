import {Component, OnInit} from '@angular/core';
import {FavoritesService} from "../favorites.service";

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit{
  haveFavorites: boolean = false
  favorites : any[] = []

  constructor(private favoriteService: FavoritesService) {
    this.haveFavorites = this.favoriteService.ids.length > 0
    this.favorites = this.favoriteService.getFavorites()
  }

  public removeFavorite(key: string) {
    this.favoriteService.removeFavorite(key)
    alert("Event Removed from Favorites!")
  }

  ngOnInit() {
    this.favoriteService.dataChanged$.subscribe(() => {
      this.favorites = this.favoriteService.getFavorites()
      this.haveFavorites = this.favoriteService.ids.length > 0
    })
  }
}
