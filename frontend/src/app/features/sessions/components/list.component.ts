import { Component, OnInit } from '@angular/core';

export interface Session {
  id: string;
  patientId: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

@Component({
  selector: 'app-sessions-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class SessionsListComponent implements OnInit {
  sessions: Session[] = [];

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    console.log('Loading sessions...');
  }
}
