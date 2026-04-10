import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionsRoutingModule } from './sessions-routing.module';
import { SessionsListComponent } from './components/list.component';

@NgModule({
  declarations: [SessionsListComponent],
  imports: [CommonModule, FormsModule, SessionsRoutingModule]
})
export class SessionsModule { }
