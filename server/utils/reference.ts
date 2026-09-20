import { randomInt } from 'node:crypto'

/** Human-facing order/ticket references. Never derived from a database ID. */
export const orderReference = () => `TC-${randomInt(20000, 99999)}`
export const ticketReference = () => `T-${randomInt(100, 999)}`
