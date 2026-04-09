export interface Patient {
  id: number;
  fullName: string;
  birthDate: string;
  sex?: string;
  internalCode?: string;
  active: boolean;
}

export interface CreatePatientDto {
  fullName: string;
  birthDate: string;
  sex?: string;
  internalCode?: string;
  active?: boolean;
}

export type CreatePatientInput = CreatePatientDto;
