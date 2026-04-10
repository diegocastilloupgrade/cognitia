import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientsRoutingModule } from './patients-routing.module';
import { PatientsListComponent } from './components/list.component';

@NgModule({
  declarations: [PatientsListComponent],
  imports: [CommonModule, FormsModule, PatientsRoutingModule]
})
export class PatientsModule { }
