'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, primaryBtnStyle, smallBtnStyle, dangerBtnStyle, cardStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

export default function LabourPage() {
  const [tab, setTab] = useState('labour')
  const [labourList, setLabourList] = useState([])
  const [teams, setTeams] = useState([])
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [contact, setContact] = useState('')
  const [wage, setWage] = useState('')
  const [teamName, setTeamName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])

  const loadLabour = async () => {
    const { data } = await supabase.from('labour').select('*').order('name')
    setLabourList(data || [])
  }
  const loadTeams = async () => {
    const { data } = await supabase.from('teams').select('*, team_members(labour_id, labour(name))')
    setTeams(data || [])
  }

  useEffect(() => { loadLabour(); loadTeams() }, [])

  const addLabour = async () => {
    if (!name || !contact) { alert('Name and contact number required'); return }
    await supabase.from('labour').insert({ name, city, aadhaar_no: aadhaar, contact_no: contact, daily_wage: parseFloat(wage) || 0 })
    setName(''); setCity(''); setAadhaar(''); setContact(''); setWage('')
    loadLabour()
  }

  const removeLabour = async (id) => {
    if (!confirm('Remove this labour?')) return
    await supabase.from('labour').delete().eq('id', id)
    loadLabour()
  }

  const toggleMember = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const createTeam = async () => {
    if (!teamName || selectedMembers.length === 0) { alert('Team name and at least one member required'); return }
    const { data: team, error } = await supabase.from('teams').insert({ name: teamName }).select().single()
    if (error) { alert(error.message); return }
    const rows = selectedMembers.map(labour_id => ({ team_id: team.id, labour_id }))
    await supabase.from('team_members').insert(rows)
    setTeamName(''); setSelectedMembers([])
    loadTeams()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', padding: 24, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: companyInfo.themeColor, margin: '0 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Labour Management</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Organize teams and workforce data with a premium experience.</p>
        </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('labour')} style={tab === 'labour' ? primaryBtnStyle : smallBtnStyle}>Labour</button>
        <button onClick={() => setTab('teams')} style={tab === 'teams' ? primaryBtnStyle : smallBtnStyle}>Teams</button>
      </div>

      {tab === 'labour' && (
        <>
          <div style={cardStyle}>
            <h3>Add Labour</h3>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
            <input placeholder="Aadhaar No." value={aadhaar} onChange={e => setAadhaar(e.target.value)} style={inputStyle} />
            <input placeholder="Contact No." value={contact} onChange={e => setContact(e.target.value)} style={inputStyle} />
            <input placeholder="Daily Wage (Rs.)" type="number" value={wage} onChange={e => setWage(e.target.value)} style={inputStyle} />
            <button onClick={addLabour} style={primaryBtnStyle}>Add Labour</button>
          </div>

          {labourList.map(l => (
            <div key={l.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{l.name}</strong> — {l.city}<br />
                <span style={{ fontSize: 13, color: '#666' }}>Aadhaar: {l.aadhaar_no} | {l.contact_no} | Rs.{l.daily_wage}/day</span>
              </div>
              <button onClick={() => removeLabour(l.id)} style={dangerBtnStyle}>Remove</button>
            </div>
          ))}
        </>
      )}

      {tab === 'teams' && (
        <>
          <div style={cardStyle}>
            <h3>Create Team</h3>
            <input placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} style={inputStyle} />
            <p style={{ fontSize: 13 }}>Select members:</p>
            {labourList.map(l => (
              <label key={l.id} style={{ display: 'block', marginBottom: 4 }}>
                <input type="checkbox" checked={selectedMembers.includes(l.id)} onChange={() => toggleMember(l.id)} /> {l.name}
              </label>
            ))}
            <button onClick={createTeam} style={primaryBtnStyle}>Create Team</button>
          </div>

          {teams.map(t => (
            <div key={t.id} style={cardStyle}>
              <strong>{t.name}</strong>
              <ul>{t.team_members.map((m, i) => <li key={i}>{m.labour?.name}</li>)}</ul>
            </div>
          ))}
        </>
      )}
      </div>
    </div>
  )
}