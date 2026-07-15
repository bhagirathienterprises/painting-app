import { supabase } from './supabaseClient'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

// table: 'quotations' | 'invoices' | 'work_orders'
// column: 'quotation_no' | 'invoice_no' | 'wo_no'
// prefix: any short code, e.g. 'BG', 'INV', 'WO'
export async function getNextDocNumber(table, column, prefix) {
  const now = new Date()
  const monthCode = MONTHS[now.getMonth()]
  const fullPrefix = `${prefix}-${monthCode}-`

  const { data, error } = await supabase
    .from(table)
    .select(column)
    .ilike(column, `${fullPrefix}%`)
    .order(column, { ascending: false })
    .limit(1)

  if (error) throw error

  let nextNum = 1
  if (data && data.length > 0) {
    const lastNo = data[0][column]
    const lastNum = parseInt(lastNo.split('-').pop(), 10)
    nextNum = lastNum + 1
  }
  return `${fullPrefix}${String(nextNum).padStart(3, '0')}`
}