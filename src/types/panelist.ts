export interface Panelist {
  id: number;
  name: string;
  email: string;
  domain: string;
}

export type PanelistPayload = Omit<Panelist, 'id'>;
