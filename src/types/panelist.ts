export interface Panelist {
  id: number;
  name: string;
  email: string;
  domain: string;
}

export interface PanelistPayload {
  name: string;
  email: string;
  domain: string;
  password: string;
}
