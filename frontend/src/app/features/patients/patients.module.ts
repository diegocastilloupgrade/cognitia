import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientsRoutingModule } from './patients-routing.module';
import { PatientsListComponent } from './components/list.component';
import { PatientEditComponent } from './components/edit.component';

@NgModule({
  declarations: [PatientsListComponent, PatientEditComponent],
  imports: [CommonModule, FormsModule, PatientsRoutingModule]
})
export class PatientsModule { }
