import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FavoritesService{
  ids: string[] = []
  private dataChangedSrc = new Subject()
  dataChanged$ = this.dataChangedSrc.asObservable()

  constructor() {
    const tmp = JSON.parse(localStorage.getItem('ids') || '[]')

    for(let id of tmp) {
      this.ids.push(id)
    }
  }

  public emitDataChanged() {
    this.dataChangedSrc.next('')
  }

  private saveIds() {
    localStorage.setItem('ids', JSON.stringify(this.ids))
    this.emitDataChanged()
  }

  public addFavorite(key: string, value:object) {
    this.ids.push(key)
    localStorage.setItem(key, JSON.stringify(value))
    this.saveIds()
  }

  public isFavorited(key: string) {
    return this.ids.findIndex(id => id === key) != -1
  }

  public removeFavorite(key: string) {
    this.ids = this.ids.filter(id => id !== key)
    localStorage.removeItem(key)
    this.saveIds()
  }

  public getFavorites() {
    let favorites: any[] = []
    for(let id of this.ids) {
      favorites.push(JSON.parse(localStorage.getItem(id) || '{}'))
    }
    return favorites
  }
}
