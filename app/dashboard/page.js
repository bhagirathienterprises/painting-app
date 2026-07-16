'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, labelStyle, cardStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [approvedQuotesByProject, setApprovedQuotesByProject] = useState({})
  const [projectId, setProjectId] = useState('')
  const [projectStats, setProjectStats] = useState(null)
  const [monthlyStats, setMonthlyStats] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: approvedQuotes } = await supabase
        .from('quotations')
        .select('*, projects(*, customers(name))')
        .eq('status', 'approved')
        .not('project_id', 'is', null)

      const quotesMap = {}
      const approvedProjects = (approvedQuotes || [])
        .filter(q => q.projects)
        .map(q => {
          quotesMap[q.project_id] = q
          return q.projects
        })

      setApprovedQuotesByProject(quotesMap)
      setProjects(approvedProjects)
      loadMonthly(Object.keys(quotesMap))
    }
    load()
  }, [])

  const loadProjectStats = async (pid) => {
    if (!pid) { setProjectStats(null); return }
    const approvedQ = approvedQuotesByProject[pid]

    const { data: invoices } = await supabase.from('invoices').select('subtotal, cgst, sgst').eq('project_id', pid)
    const { data: expenses } = await supabase.from('expenses').select('amount').eq('project_id', pid)
    const { data: attendance } = await supabase.from('attendance').select('wage_calculated').eq('project_id', pid)

    let quoted = 0
    let totalGst = 0
    if (invoices && invoices.length > 0) {
      quoted = invoices.reduce((s, i) => s + i.subtotal, 0)
      totalGst = invoices.reduce((s, i) => s + i.cgst + i.sgst, 0)
    } else if (approvedQ) {
      quoted = approvedQ.subtotal || 0
      totalGst = (approvedQ.cgst || 0) + (approvedQ.sgst || 0)
    }

    const totalExpenses = (expenses || []).reduce((s, e) => s + e.amount, 0)
    const totalLabour = (attendance || []).reduce((s, a) => s + a.wage_calculated, 0)
    const profit = quoted - totalExpenses - totalLabour - totalGst

    setProjectStats({ quoted, totalExpenses, totalLabour, totalGst, profit })
  }

  const loadMonthly = async (approvedProjectIds) => {
    if (!approvedProjectIds || approvedProjectIds.length === 0) {
      setMonthlyStats({ sales: 0, totalExpenses: 0, totalLabour: 0, profit: 0 })
      return
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const isoStart = startOfMonth.toISOString()

    const { data: invoices } = await supabase
      .from('invoices').select('subtotal, cgst, sgst, project_id')
      .gte('created_at', isoStart)
      .in('project_id', approvedProjectIds)

    const { data: expenses } = await supabase
      .from('expenses').select('amount, project_id')
      .gte('created_at', isoStart)
      .in('project_id', approvedProjectIds)

    const { data: attendance } = await supabase
      .from('attendance').select('wage_calculated, project_id')
      .gte('created_at', isoStart)
      .in('project_id', approvedProjectIds)

    const sales = (invoices || []).reduce((s, i) => s + i.subtotal, 0)
    const gst = (invoices || []).reduce((s, i) => s + i.cgst + i.sgst, 0)
    const totalExpenses = (expenses || []).reduce((s, e) => s + e.amount, 0)
    const totalLabour = (attendance || []).reduce((s, a) => s + a.wage_calculated, 0)
    const profit = sales - totalExpenses - totalLabour - gst

    setMonthlyStats({ sales, totalExpenses, totalLabour, profit })
  }

  useEffect(() => { loadProjectStats(projectId) }, [projectId, approvedQuotesByProject])

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
        <h3>This Month — Approved Projects Only</h3>
        {monthlyStats && (
          <>
            <p style={{ margin: '8px 0', color: '#0f172a' }}>Total Sales: Rs. {monthlyStats.sales.toFixed(2)}</p>
            <p style={{ margin: '8px 0', color: '#0f172a' }}>Total Expenses: Rs. {monthlyStats.totalExpenses.toFixed(2)}</p>
            <p style={{ margin: '8px 0', color: '#0f172a' }}>Total Labour: Rs. {monthlyStats.totalLabour.toFixed(2)}</p>
            <p style={{ margin: '8px 0', color: '#0f172a' }}>Profit/Loss: <ProfitLoss value={monthlyStats.profit} /></p>
          </>
        )}
      </div>

      <div style={cardStyle}>
        <h3>Per-Project Profit &amp; Loss (Approved projects only)</h3>
        <label style={labelStyle}>Select Project</label>
        <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
          <option value="">-- Select Project --</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.customers?.name})</option>)}
        </select>

        {projectStats && (
          <>
            <p style={{ margin: '12px 0 0', color: '#0f172a' }}>Quoted Amount: Rs. {projectStats.quoted.toFixed(2)}</p>
            <p style={{ margin: '8px 0', color: '#0f172a' }}>Expenses: Rs. {projectStats.totalExpenses.toFixed(2)}</p>
            <p style={{ margin: '8px 0', color: '#0f172a' }}>Labour Payable: Rs. {projectStats.totalLabour.toFixed(2)}</p>
            <p style={{ margin: '8px 0', color: '#0f172a' }}>GST: Rs. {projectStats.totalGst.toFixed(2)}</p>
            <p style={{ margin: '8px 0', color: '#0f172a' }}>Profit/Loss: <ProfitLoss value={projectStats.profit} /></p>
          </>
        )}
      </div>
      </div>
    </div>
  )
}