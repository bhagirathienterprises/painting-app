'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getNextDocNumber } from '../../lib/docNumber'
import { generateWorkOrderPdf } from '../../lib/generateWorkOrderPdf'
import { inputStyle, primaryBtnStyle, secondaryBtnStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

export default function WorkOrderPage() {
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [projectId, setProjectId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [equipment, setEquipment] = useState('')
  const [instructions, setInstructions] = useState('')
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [woNo, setWoNo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('projects').select('*, customers(name)').order('created_at', { ascending: false })
      setProjects(p || [])
      const { data: t } = await supabase.from('teams').select('*')
      setTeams(t || [])
    }
    load()
  }, [])

  const handleGenerate = async () => {
    if (!projectId) { alert('Select a project'); return }
    setLoading(true)
    try {
      const woNumber = await getNextDocNumber('work_orders', 'wo_no', 'WO')
      const project = projects.find(p => p.id === projectId)
      const team = teams.find(t => t.id === teamId)

      await supabase.from('work_orders').insert({ project_id: projectId, team_id: teamId || null, equipment, instructions, wo_no: woNumber })

      const dateStr = new Date().toLocaleDateString('en-IN')
      const pdfBytes = await generateWorkOrderPdf({ workOrderNo: woNumber, projectTitle: project?.title, teamName: team?.name, equipment, instructions, date: dateStr })
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setPdfUrl(URL.createObjectURL(blob))
      setPdfBlob(blob)
      setWoNo(woNumber)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!pdfBlob || !woNo) return
    const file = new File([pdfBlob], `${woNo}.pdf`, { type: 'application/pdf' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Work Order ${woNo}` })
    } else {
      alert('Sharing not supported here — use Download instead.')
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: companyInfo.themeColor }}>New Work Order</h1>

      <label>Project</label>
      <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
        <option value="">-- Select --</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.customers?.name})</option>)}
      </select>

      <label>Team</label>
      <select value={teamId} onChange={e => setTeamId(e.target.value)} style={inputStyle}>
        <option value="">-- None --</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <label>Equipment Needed (e.g. boom lift, scaffolding)</label>
      <input value={equipment} onChange={e => setEquipment(e.target.value)} style={inputStyle} />

      <label>Instructions</label>
      <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={5} style={inputStyle} />

      <button onClick={handleGenerate} disabled={loading} style={primaryBtnStyle}>
        {loading ? 'Generating...' : 'Generate Work Order PDF'}
      </button>

      {pdfUrl && (
        <div style={{ marginTop: 20, padding: 16, background: '#f0f4fa', borderRadius: 8 }}>
          <p style={{ fontWeight: 'bold', color: companyInfo.themeColor }}>Work Order {woNo} ready</p>
          <a href={pdfUrl} download={`${woNo}.pdf`} style={secondaryBtnStyle}>Download PDF</a>
          <button onClick={handleShare} style={{ ...primaryBtnStyle, background: '#25D366', marginTop: 8 }}>Share on WhatsApp</button>
        </div>
      )}
    </div>
  )
}