/** Money is stored and computed in paise; only the edges convert to rupees. */
export const toPaise = (rupees: number) => Math.round(rupees * 100)
export const toRupees = (paise: number) => paise / 100
export const formatInr = (paise: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(toRupees(paise))
