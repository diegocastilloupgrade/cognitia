import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResultsRoutingModule } from './results-routing.module';
import { ResultsListComponent } from './components/list.component';

@NgModule({
  declarations: [ResultsListComponent],
  imports: [CommonModule, FormsModule, ResultsRoutingModule]
})
export class ResultsModule { }
