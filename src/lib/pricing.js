export const TICKET_PRICES = { normal: 80000, vip: 120000, couple: 150000 };
export function calcTotal(ticketType, seatCount) {
  return (TICKET_PRICES[ticketType] || 0) * seatCount;
}
