const toneMap = {
  green: true,
  blue: true,
  amber: true,
  red: true,
  zinc: true,
};

export type BadgeTone = keyof typeof toneMap;

export function statusTone(status?: string): BadgeTone {
  if (status === 'OPEN' || status === 'CHECKED_IN' || status === 'HIRE' || status === 'SELECTED') return 'green';
  if (status === 'ASSIGNED' || status === 'COMPLETED') return 'blue';
  if (status === 'DRAFT' || status === 'REGISTERED' || status === 'HOLD') return 'amber';
  if (status === 'CLOSED' || status === 'REJECT' || status === 'REJECTED') return 'red';
  return 'zinc';
}
