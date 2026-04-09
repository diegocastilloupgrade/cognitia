import { Component } from '@angular/core';

@Component({
  selector: 'app-execution',
  templateUrl: './execution.component.html',
  styleUrls: ['./execution.component.css']
})
export class ExecutionComponent {
  isRunning = false;

  startExecution(): void {
    this.isRunning = true;
    console.log('Starting execution...');
  }

  stopExecution(): void {
    this.isRunning = false;
    console.log('Stopping execution...');
  }
}
