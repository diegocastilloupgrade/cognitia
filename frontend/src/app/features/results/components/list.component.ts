import { Component, OnInit } from '@angular/core';

export interface Result {
  id: string;
  sessionId: string;
  score: number;
  createdAt: string;
}

@Component({
  selector: 'app-results-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ResultsListComponent implements OnInit {
  results: Result[] = [];

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    console.log('Loading results...');
  }
}
