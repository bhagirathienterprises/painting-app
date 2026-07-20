'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { generatePayslipPdf } from '../../lib/generatePayslipPdf'
import { inputStyle, primaryBtnStyle, secondaryBtnStyle, cardStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

export default function PayslipPage() {
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [projectId, setProjectId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [totalPayable, setTotalPayable] = useState(0)
  const [alreadyPaid, setAlreadyPaid] = useState(0)
  const [memberShares, setMemberShares] = useState([])
  const [payAmount, setPayAmount] = useState('')
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('projects').select('*, customers(name)').order('created_at', { ascending: false })
      setProjects(p || [])
      const { data: t } = await supabase.from('teams').select('*, team_members(labour_id, labour(name))')
      setTeams(t || [])
    }
    load()
  }, [])

  const loadPayable = async () => {
    if (!projectId || !teamId) return
    const team = teams.find(t => t.id === teamId)
    const memberIds = team.team_members.map(m => m.labour_id)

    const { data: attendance } = await supabase
      .from('attendance')
      .select('labour_id, wage_calculated, labour(name)')
      .eq('project_id', projectId)
      .in('labour_id', memberIds)

    const totals = {}
    ;(attendance || []).forEach(a => {
      if (!totals[a.labour_id]) totals[a.labour_id] = { name: a.labour?.name, total: 0 }
      totals[a.labour_id].total += a.wage_calculated
    })
    const totalPayableNow = Object.values(totals).reduce((s, m) => s + m.total, 0)

    const { data: payments } = await supabase.from('labour_payments').select('amount_paid').eq('project_id', projectId).eq('team_id', teamId)
    const paidSoFar = (payments || []).reduce((s, p) => s + p.amount_paid, 0)

    setTotalPayable(totalPayableNow)
    setAlreadyPaid(paidSoFar)
    setMemberShares(Object.values(totals))
  }

  useEffect(() => { loadPayable() }, [projectId, teamId])

  const handleGenerate = async () => {
    if (!projectId || !teamId || !payAmount) { alert('Select project, team, and enter amount'); return }
    const amt = parseFloat(payAmount)
    const remainingBefore = totalPayable - alreadyPaid
    if (amt > remainingBefore + 0.01) { alert(`This exceeds the remaining payable amount of Rs. ${remainingBefore.toFixed(2)}`); return }

    setLoading(true)
    try {
      await supabase.from('labour_payments').insert({ project_id: projectId, team_id: teamId, amount_paid: amt })

      // proportionally split this payment across members based on their share of total payable
      const memberAmounts = memberShares.map(m => ({
        name: m.name,
        amount: totalPayable > 0 ? (m.total / totalPayable) * amt : 0,
      }))

      const project = projects.find(p => p.id === projectId)
      const team = teams.find(t => t.id === teamId)
      const remaining = totalPayable - (alreadyPaid + amt)
      const dateStr = new Date().toLocaleDateString('en-IN')
      const payslipNo = `PS-${Date.now().toString().slice(-6)}`

      const pdfBytes = await generatePayslipPdf({
        payslipNo,
        projectTitle: project?.title,
        teamName: team?.name,
        memberAmounts,
        amountPaid: amt,
        totalPayable,
        remaining,
        date: dateStr,
      })

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setPdfUrl(URL.createObjectURL(blob))
      setPdfBlob(blob)
      setPayAmount('')
      loadPayable()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!pdfBlob) return
    const file = new File([pdfBlob], `payslip.pdf`, { type: 'application/pdf' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Labour Payslip' })
    } else {
      alert('Sharing not supported here — use Download instead.')
    }
  }

  const remaining = totalPayable - alreadyPaid

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: companyInfo.themeColor }}>Labour Payslip</h1>

      <label>Project</label>
      <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
        <option value="">-- Select --</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.customers?.name})</option>)}
      </select>

      <label>Team</label>
      <select value={teamId} onChange={e => setTeamId(e.target.value)} style={inputStyle}>
        <option value="">-- Select --</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      {projectId && teamId && (
        <div style={cardStyle}>
          <p>Total Payable: <strong>Rs. {totalPayable.toFixed(2)}</strong></p>
          <p>Already Paid: <strong>Rs. {alreadyPaid.toFixed(2)}</strong></p>
          <p>Remaining: <strong style={{ color: remaining > 0.01 ? '#c0392b' : '#27ae60' }}>Rs. {remaining.toFixed(2)}</strong></p>
        </div>
      )}

      <label>Amount Paying Now — Rs.</label>
      <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={inputStyle} />

      <button onClick={handleGenerate} disabled={loading} style={primaryBtnStyle}>
        {loading ? 'Generating...' : 'Pay & Generate Payslip'}
      </button>

      {pdfUrl && (
        <div style={{ marginTop: 20, padding: 16, background: '#f0f4fa', borderRadius: 8 }}>
          <p style={{ fontWeight: 'bold', color: companyInfo.themeColor }}>Payslip ready</p>
          <a href={pdfUrl} download="payslip.pdf" style={secondaryBtnStyle}>Download PDF</a>
          <button onClick={handleShare} style={{ ...primaryBtnStyle, background: '#25D366', marginTop: 8 }}>Share on WhatsApp</button>
        </div>
      )}
    </div>
  )
}