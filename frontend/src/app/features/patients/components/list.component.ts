import { Component, OnInit } from '@angular/core';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

@Component({
  selector: 'app-patients-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class PatientsListComponent implements OnInit {
  patients: Patient[] = [];

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    console.log('Loading patients...');
  }
}
