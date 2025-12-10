// Activity-related types

export interface Activity {
  id: number;
  timestamp: string;
  actionType: string;
  description: string;
  patientId?: string;
}
