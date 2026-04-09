import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientsRoutingModule } from './patients-routing.module';
import { PatientsListComponent } from './components/list.component';

@NgModule({
  declarations: [PatientsListComponent],
  imports: [CommonModule, PatientsRoutingModule]
})
export class PatientsModule { }
