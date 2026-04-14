import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientsListComponent } from './components/list.component';
import { PatientEditComponent } from './components/edit.component';
import { CreatePatientComponent } from './components/create.component';

const routes: Routes = [
  {
    path: '',
    component: PatientsListComponent
  },
  {
    path: 'list',
    component: PatientsListComponent
  },
  {
    path: 'new',
    component: CreatePatientComponent
  },
  {
    path: ':id/edit',
    component: PatientEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule { }
