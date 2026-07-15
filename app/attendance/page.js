'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, primaryBtnStyle, cardStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

const DAY_TYPES = {
  full: { label: 'Full Day', multiplier: 1 },
  one_half: { label: 'One and a Half Day', multiplier: 1.5 },
  half: { label: 'Half Day', multiplier: 0.5 },
}

export default function AttendancePage() {
  const [labourList, setLabourList] = useState([])
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [entries, setEntries] = useState({})
  const [weeklyTotals, setWeeklyTotals] = useState([])

  useEffect(() => {
    async function load() {
      const { data: l } = await supabase.from('labour').select('*').order('name')
      setLabourList(l || [])
      const { data: p } = await supabase.from('projects').select('*, customers(name)').order('created_at', { ascending: false })
      setProjects(p || [])
    }
    load()
    loadWeeklyTotals()
  }, [])

  const setEntry = (labourId, dayType) => setEntries(prev => ({ ...prev, [labourId]: dayType }))

  const saveAttendance = async () => {
    if (!projectId) { alert('Select a project'); return }
    const rows = Object.entries(entries).map(([labour_id, day_type]) => {
      const labour = labourList.find(l => l.id === labour_id)
      const wage = (labour?.daily_wage || 0) * DAY_TYPES[day_type].multiplier
      return { labour_id, project_id: projectId, date, day_type, wage_calculated: wage }
    })
    if (rows.length === 0) { alert('Mark at least one labour'); return }
    const { error } = await supabase.from('attendance').insert(rows)
    if (error) { alert(error.message); return }
    alert('Attendance saved for ' + date)
    setEntries({})
    loadWeeklyTotals()
  }

  const loadWeeklyTotals = async () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { data } = await supabase.from('attendance').select('labour_id, wage_calculated, labour(name)').gte('date', weekAgo.toISOString().slice(0, 10))
    const totals = {}
    ;(data || []).forEach(row => {
      const key = row.labour_id
      if (!totals[key]) totals[key] = { name: row.labour?.name, total: 0 }
      totals[key].total += row.wage_calculated
    })
    setWeeklyTotals(Object.values(totals))
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: companyInfo.themeColor }}>Daily Attendance</h1>

      <label>Project</label>
      <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
        <option value="">-- Select Project --</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.customers?.name})</option>)}
      </select>

      <label>Date</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />

      <h3>Mark Attendance</h3>
      {labourList.map(l => (
        <div key={l.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{l.name}</span>
          <select value={entries[l.id] || ''} onChange={e => setEntry(l.id, e.target.value)} style={{ ...inputStyle, width: 180, margin: 0 }}>
            <option value="">Not worked</option>
            <option value="full">Full Day</option>
            <option value="one_half">1.5 Day</option>
            <option value="half">Half Day</option>
          </select>
        </div>
      ))}

      <button onClick={saveAttendance} style={primaryBtnStyle}>Save Attendance</button>

      <h3 style={{ marginTop: 30 }}>Last 7 Days — Payable per Labour</h3>
      {weeklyTotals.map((t, i) => <div key={i} style={cardStyle}><strong>{t.name}</strong>: Rs. {t.total.toFixed(2)}</div>)}
    </div>
  )
}