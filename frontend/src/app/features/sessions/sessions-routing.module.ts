import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionsListComponent } from './components/list.component';
import { SessionDetailComponent } from './components/detail.component';

const routes: Routes = [
  {
    path: '',
    component: SessionsListComponent
  },
  {
    path: 'list',
    component: SessionsListComponent
  },
  {
    path: ':id',
    component: SessionDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsRoutingModule { }
