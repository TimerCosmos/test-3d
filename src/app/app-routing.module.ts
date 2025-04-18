import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThreeSceneComponent } from './three-scene/three-scene.component';
import { CompComponent } from './comp/comp.component';

const routes: Routes = [
{path:'',redirectTo:'threed',pathMatch:'full'},
{path:'threed',component:ThreeSceneComponent},
{path:'newComp',component:CompComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
