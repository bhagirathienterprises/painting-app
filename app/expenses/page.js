'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, primaryBtnStyle, cardStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

export default function ExpensesPage() {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [category, setCategory] = useState('material')
  const [amount, setAmount] = useState('')
  const [selfPaid, setSelfPaid] = useState(false)
  const [note, setNote] = useState('')
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('projects').select('*, customers(name)').order('created_at', { ascending: false })
      setProjects(p || [])
    }
    load()
  }, [])

  const loadExpenses = async (pid) => {
    if (!pid) { setExpenses([]); return }
    const { data } = await supabase.from('expenses').select('*').eq('project_id', pid).order('created_at', { ascending: false })
    setExpenses(data || [])
  }

  useEffect(() => { loadExpenses(projectId) }, [projectId])

  const addExpense = async () => {
    if (!projectId || !amount) { alert('Select project and enter amount'); return }
    await supabase.from('expenses').insert({ project_id: projectId, category, amount: parseFloat(amount), self_paid: selfPaid, note })
    setAmount(''); setNote(''); setSelfPaid(false)
    loadExpenses(projectId)
  }

  const toggleReimbursed = async (id, current) => {
    await supabase.from('expenses').update({ reimbursed: !current }).eq('id', id)
    loadExpenses(projectId)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', padding: 24, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: companyInfo.themeColor, margin: '0 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Expense Tracker</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Track spending with a calm and focused experience.</p>
        </div>

      <label>Project</label>
      <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
        <option value="">-- Select Project --</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.customers?.name})</option>)}
      </select>

      <div style={cardStyle}>
        <h3>Add Expense</h3>
        <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
          <option value="material">Material</option>
          <option value="food">Food</option>
          <option value="travel">Travel</option>
          <option value="other">Other</option>
        </select>
        <input placeholder="Amount (Rs.)" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
        <label style={{ display: 'block', marginBottom: 10 }}>
          <input type="checkbox" checked={selfPaid} onChange={e => setSelfPaid(e.target.checked)} /> Paid from my own pocket (pending reimbursement)
        </label>
        <input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} style={inputStyle} />
        <button onClick={addExpense} style={primaryBtnStyle}>Add Expense</button>
      </div>

      <h3>Expenses for this project</h3>
      {expenses.map(e => (
        <div key={e.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{e.category}</strong> — Rs. {e.amount}<br />
            <span style={{ fontSize: 12, color: '#666' }}>{e.note}</span>
          </div>
          {e.self_paid && (
            <button onClick={() => toggleReimbursed(e.id, e.reimbursed)} style={{ background: e.reimbursed ? '#2ecc71' : '#f1c40f', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
              {e.reimbursed ? 'Reimbursed' : 'Mark Reimbursed'}
            </button>
          )}
        </div>
      ))}
      </div>
    </div>
  )
}