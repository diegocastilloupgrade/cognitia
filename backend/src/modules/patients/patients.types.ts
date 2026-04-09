export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  birthDate: string;
}
