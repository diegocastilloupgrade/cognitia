import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutionRoutingModule } from './execution-routing.module';
import { ExecutionComponent } from './components/execution.component';

@NgModule({
  declarations: [ExecutionComponent],
  imports: [CommonModule, ExecutionRoutingModule]
})
export class ExecutionModule { }
