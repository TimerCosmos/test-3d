import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ThreeSceneComponent } from './three-scene/three-scene.component';
import { CompComponent } from './comp/comp.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
// import Ammo from 'ammo.js';

@NgModule({
  declarations: [
    AppComponent,
    CompComponent,
    ThreeSceneComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule, MatDividerModule, MatIconModule  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
