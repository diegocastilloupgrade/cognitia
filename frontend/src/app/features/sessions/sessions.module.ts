import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsRoutingModule } from './sessions-routing.module';
import { SessionsListComponent } from './components/list.component';

@NgModule({
  declarations: [SessionsListComponent],
  imports: [CommonModule, SessionsRoutingModule]
})
export class SessionsModule { }
