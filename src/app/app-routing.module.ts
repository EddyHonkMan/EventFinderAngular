import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {EventSearchFormComponent} from "./event-search-form/event-search-form.component";
import {FavoritesComponent} from "./favorites/favorites.component";

const routes: Routes = [
  { path: 'search', component: EventSearchFormComponent, title: 'search' },
  { path: 'favorites', component: FavoritesComponent, title: 'favorites' },
  { path: '',   redirectTo: '/search', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
