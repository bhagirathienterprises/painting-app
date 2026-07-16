import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const STORAGE_PREFIX = 'painting-app-local'

const missingConfigError = new Error(
  'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables.'
)

function createFallbackClient() {
  const chain = () => ({
    select: () => chain(),
    insert: () => chain(),
    update: () => chain(),
    delete: () => chain(),
    eq: () => chain(),
    gte: () => chain(),
    order: () => chain(),
    limit: () => chain(),
    single: () => chain(),
    then: (resolve) => resolve({ data: null, error: missingConfigError }),
  })

  return {
    from: () => chain(),
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase Config Missing:', {
    url: supabaseUrl ? '✓' : '✗ NEXT_PUBLIC_SUPABASE_URL',
    key: supabaseKey ? '✓' : '✗ NEXT_PUBLIC_SUPABASE_ANON_KEY',
  })
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : createFallbackClient()

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export function isRlsError(error) {
  if (!error) return false
  const message = String(error?.message || '').toLowerCase()
  return message.includes('row-level security') || message.includes('policy') || error?.status === 403 || error?.code === '42501'
}

function getStorageKey(table) {
  return `${STORAGE_PREFIX}:${table}`
}

function readLocalRows(table) {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(getStorageKey(table)) || '[]')
  } catch {
    return []
  }
}

function writeLocalRows(table, rows) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getStorageKey(table), JSON.stringify(rows))
}

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeRecord(table, payload) {
  return {
    id: payload.id || createLocalId(table),
    ...payload,
    created_at: payload.created_at || new Date().toISOString(),
  }
}

export async function listRecords(table, select = '*') {
  try {
    const { data, error } = await supabase.from(table).select(select)
    if (error) {
      if (isRlsError(error)) {
        return { data: readLocalRows(table), error: null }
      }
      throw error
    }
    return { data: data || [], error: null }
  } catch (error) {
    if (isRlsError(error)) {
      return { data: readLocalRows(table), error: null }
    }
    return { data: [], error }
  }
}

export async function createRecord(table, payload) {
  try {
    const { error } = await supabase.from(table).insert(payload)
    if (error) {
      if (isRlsError(error)) {
        const record = normalizeRecord(table, payload)
        const rows = [record, ...readLocalRows(table)]
        writeLocalRows(table, rows)
        return { data: record, error: null }
      }
      throw error
    }
    return { data: payload, error: null }
  } catch (error) {
    if (isRlsError(error)) {
      const record = normalizeRecord(table, payload)
      const rows = [record, ...readLocalRows(table)]
      writeLocalRows(table, rows)
      return { data: record, error: null }
    }
    return { data: null, error }
  }
}

export async function updateRecord(table, id, payload) {
  try {
    const { error } = await supabase.from(table).update(payload).eq('id', id)
    if (error) {
      if (isRlsError(error)) {
        const rows = readLocalRows(table).map(item => item.id === id ? { ...item, ...payload } : item)
        writeLocalRows(table, rows)
        return { data: rows.find(item => item.id === id), error: null }
      }
      throw error
    }
    return { data: payload, error: null }
  } catch (error) {
    if (isRlsError(error)) {
      const rows = readLocalRows(table).map(item => item.id === id ? { ...item, ...payload } : item)
      writeLocalRows(table, rows)
      return { data: rows.find(item => item.id === id), error: null }
    }
    return { data: null, error }
  }
}

export async function deleteRecord(table, id) {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      if (isRlsError(error)) {
        const rows = readLocalRows(table).filter(item => item.id !== id)
        writeLocalRows(table, rows)
        return { data: true, error: null }
      }
      throw error
    }
    return { data: true, error: null }
  } catch (error) {
    if (isRlsError(error)) {
      const rows = readLocalRows(table).filter(item => item.id !== id)
      writeLocalRows(table, rows)
      return { data: true, error: null }
    }
    return { data: null, error }
  }
}

export async function createCustomer(payload) {
  return createRecord('customers', payload)
}

export async function createQuotation(payload) {
  return createRecord('quotations', payload)
}

export async function createProject(payload) {
  return createRecord('projects', payload)
}

export async function getQuotations() {
  const { data, error } = await listRecords('quotations', '*, customers(name, phone, type)')
  if (error) return { data: [], error }
  const rows = (data || []).map(item => ({
    ...item,
    customers: item.customers || ({
      name: item.customer_name || 'Customer',
      phone: item.customer_phone || '',
      type: item.customer_type || 'individual',
    }),
  }))
  return { data: rows, error: null }
}

export async function getProjects() {
  return listRecords('projects', '*')
}

export async function updateQuotationStatus(id, status) {
  return updateRecord('quotations', id, { status })
}

export async function linkQuotationToProject(id, projectId) {
  return updateRecord('quotations', id, { project_id: projectId, status: 'approved' })
}

export async function deleteProject(id) {
  return deleteRecord('projects', id)
}