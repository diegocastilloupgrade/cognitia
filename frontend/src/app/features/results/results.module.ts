import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsRoutingModule } from './results-routing.module';
import { ResultsListComponent } from './components/list.component';

@NgModule({
  declarations: [ResultsListComponent],
  imports: [CommonModule, ResultsRoutingModule]
})
export class ResultsModule { }
