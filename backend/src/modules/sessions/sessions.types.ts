export interface Session {
  id: string;
  patientId: string;
  status: "scheduled" | "in-progress" | "completed";
}

export interface CreateSessionInput {
  patientId: string;
}
