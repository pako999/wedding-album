/** Display an ISO calendar date without parsing it into a timezone. */
export function formatEuropeanDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}
