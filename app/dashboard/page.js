'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, cardStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [projectStats, setProjectStats] = useState(null)
  const [monthlyStats, setMonthlyStats] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('projects').select('*, customers(name)').order('created_at', { ascending: false })
      setProjects(data || [])
    }
    load()
    loadMonthly()
  }, [])

  const loadProjectStats = async (pid) => {
    if (!pid) { setProjectStats(null); return }
    const { data: quotes } = await supabase.from('quotations').select('grand_total').eq('project_id', pid)
    const { data: invoices } = await supabase.from('invoices').select('grand_total, cgst, sgst').eq('project_id', pid)
    const { data: expenses } = await supabase.from('expenses').select('amount').eq('project_id', pid)
    const { data: attendance } = await supabase.from('attendance').select('wage_calculated').eq('project_id', pid)

    const quoted = quotes?.[0]?.grand_total || 0
    const totalExpenses = (expenses || []).reduce((s, e) => s + e.amount, 0)
    const totalLabour = (attendance || []).reduce((s, a) => s + a.wage_calculated, 0)
    const totalGst = (invoices || []).reduce((s, i) => s + i.cgst + i.sgst, 0)
    const profit = quoted - totalExpenses - totalLabour - totalGst

    setProjectStats({ quoted, totalExpenses, totalLabour, totalGst, profit })
  }

  const loadMonthly = async () => {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const isoStart = startOfMonth.toISOString()

    const { data: invoices } = await supabase.from('invoices').select('grand_total').gte('created_at', isoStart)
    const { data: expenses } = await supabase.from('expenses').select('amount').gte('created_at', isoStart)
    const { data: attendance } = await supabase.from('attendance').select('wage_calculated').gte('created_at', isoStart)

    const sales = (invoices || []).reduce((s, i) => s + i.grand_total, 0)
    const totalExpenses = (expenses || []).reduce((s, e) => s + e.amount, 0)
    const totalLabour = (attendance || []).reduce((s, a) => s + a.wage_calculated, 0)
    const profit = sales - totalExpenses - totalLabour

    setMonthlyStats({ sales, totalExpenses, totalLabour, profit })
  }

  useEffect(() => { loadProjectStats(projectId) }, [projectId])

  const ProfitLoss = ({ value }) => (
    <strong style={{ color: value >= 0 ? '#27ae60' : '#c0392b' }}>
      {value >= 0 ? `Rs. ${value.toFixed(2)}` : `- Rs. ${Math.abs(value).toFixed(2)}`}
    </strong>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', padding: 24, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: companyInfo.themeColor, margin: '0 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>A clearer view of your project performance.</p>
        </div>

      <div style={cardStyle}>
        <h3>This Month — All Projects</h3>
        {monthlyStats && (
          <>
            <p>Total Sales: Rs. {monthlyStats.sales.toFixed(2)}</p>
            <p>Total Expenses: Rs. {monthlyStats.totalExpenses.toFixed(2)}</p>
            <p>Total Labour: Rs. {monthlyStats.totalLabour.toFixed(2)}</p>
            <p>Profit/Loss: <ProfitLoss value={monthlyStats.profit} /></p>
          </>
        )}
      </div>

      <div style={cardStyle}>
        <h3>Per-Project Profit &amp; Loss</h3>
        <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
          <option value="">-- Select Project --</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.customers?.name})</option>)}
        </select>

        {projectStats && (
          <>
            <p>Quoted Amount: Rs. {projectStats.quoted.toFixed(2)}</p>
            <p>Expenses: Rs. {projectStats.totalExpenses.toFixed(2)}</p>
            <p>Labour Payable: Rs. {projectStats.totalLabour.toFixed(2)}</p>
            <p>GST: Rs. {projectStats.totalGst.toFixed(2)}</p>
            <p>Profit/Loss: <ProfitLoss value={projectStats.profit} /></p>
          </>
        )}
      </div>
      </div>
    </div>
  )
}