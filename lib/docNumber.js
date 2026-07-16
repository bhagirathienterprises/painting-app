import { supabase, isRlsError, listRecords } from './supabaseClient'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

// table: 'quotations' | 'invoices' | 'work_orders'
// column: 'quotation_no' | 'invoice_no' | 'wo_no'
// prefix: any short code, e.g. 'BG', 'INV', 'WO'
export async function getNextDocNumber(table, column, prefix) {
  const now = new Date()
  const monthCode = MONTHS[now.getMonth()]
  const fullPrefix = `${prefix}-${monthCode}-`

  try {
    const { data, error } = await supabase
      .from(table)
      .select(column)
      .ilike(column, `${fullPrefix}%`)
      .order(column, { ascending: false })
      .limit(1)

    if (error) {
      if (!isRlsError(error)) throw error
      const fallback = await listRecords(table, column)
      const rows = fallback.data || []
      let nextNum = 1
      const matching = rows.filter(item => String(item[column] || '').startsWith(fullPrefix))
      if (matching.length > 0) {
        const lastNo = matching[0][column]
        const lastNum = parseInt(lastNo.split('-').pop(), 10)
        nextNum = lastNum + 1
      }
      return `${fullPrefix}${String(nextNum).padStart(3, '0')}`
    }

    let nextNum = 1
    if (data && data.length > 0) {
      const lastNo = data[0][column]
      const lastNum = parseInt(lastNo.split('-').pop(), 10)
      nextNum = lastNum + 1
    }
    return `${fullPrefix}${String(nextNum).padStart(3, '0')}`
  } catch (error) {
    if (isRlsError(error)) {
      const fallback = await listRecords(table, column)
      const rows = fallback.data || []
      let nextNum = 1
      const matching = rows.filter(item => String(item[column] || '').startsWith(fullPrefix))
      if (matching.length > 0) {
        const lastNo = matching[0][column]
        const lastNum = parseInt(lastNo.split('-').pop(), 10)
        nextNum = lastNum + 1
      }
      return `${fullPrefix}${String(nextNum).padStart(3, '0')}`
    }
    throw error
  }
}