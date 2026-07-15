'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, labelStyle, primaryBtnStyle, cardStyle } from '../../lib/uiStyles'
import { colors, spacing, typography, shadows, borderRadius, animations } from '../../lib/designSystem'
import { companyInfo } from '../../lib/companyInfo'

const DAY_TYPES = {
  full: { label: 'Full Day', multiplier: 1 },
  one_half: { label: 'One and a Half Day', multiplier: 1.5 },
  half: { label: 'Half Day', multiplier: 0.5 },
}

export default function AttendancePage() {
  const [labourList, setLabourList] = useState([])
  const [teams, setTeams] = useState([])
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [selectionMode, setSelectionMode] = useState('labour') // 'labour' or 'team'
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [entries, setEntries] = useState({})
  const [weeklyTotals, setWeeklyTotals] = useState([])
  const [teamMembers, setTeamMembers] = useState([])

  useEffect(() => {
    async function load() {
      const { data: l } = await supabase.from('labour').select('*').order('name')
      setLabourList(l || [])
      const { data: p } = await supabase.from('projects').select('*, customers(name)').order('created_at', { ascending: false })
      setProjects(p || [])
      const { data: t } = await supabase.from('teams').select('*, team_members(labour_id, labour(name, daily_wage))').order('name')
      setTeams(t || [])
    }
    load()
    loadWeeklyTotals()
  }, [])

  const handleTeamSelect = (teamId) => {
    setSelectedTeamId(teamId)
    const team = teams.find(t => t.id === teamId)
    if (team) {
      setTeamMembers(team.team_members || [])
      setEntries({})
    }
  }

  const setEntry = (labourId, dayType) => setEntries(prev => ({ ...prev, [labourId]: dayType }))

  const saveAttendance = async () => {
    if (!projectId) { alert('Select a project'); return }
    
    let rows = []
    
    if (selectionMode === 'labour') {
      rows = Object.entries(entries).map(([labour_id, day_type]) => {
        const labour = labourList.find(l => l.id === labour_id)
        const wage = (labour?.daily_wage || 0) * DAY_TYPES[day_type].multiplier
        return { labour_id, project_id: projectId, date, day_type, wage_calculated: wage }
      })
    } else {
      // Team mode: save attendance for each team member
      rows = Object.entries(entries).map(([labour_id, day_type]) => {
        const member = teamMembers.find(m => m.labour_id === labour_id)
        const labour = member?.labour
        const wage = (labour?.daily_wage || 0) * DAY_TYPES[day_type].multiplier
        return { labour_id, project_id: projectId, date, day_type, wage_calculated: wage, team_id: selectedTeamId }
      })
    }

    if (rows.length === 0) { alert('Mark at least one person'); return }
    const { error } = await supabase.from('attendance').insert(rows)
    if (error) { alert(error.message); return }
    alert(`Attendance saved for ${date}`)
    setEntries({})
    setSelectedTeamId('')
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
    <motion.div
      initial="initial"
      animate="animate"
      variants={animations.variants.fadeIn}
      transition={animations.transition.smooth}
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
        padding: spacing.xxxl,
        fontFamily: typography.fontFamily.body,
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: `${spacing.xxl} ${spacing.lg} ${spacing.xxxl}` }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animations.transition.elegant}
          style={{ marginBottom: spacing.xxl }}
        >
          <h1 style={{ color: colors.textPrimary, margin: `0 0 ${spacing.md} 0`, fontSize: typography.fontSize.h2, fontWeight: typography.fontWeight.extrabold, letterSpacing: '-0.02em', fontFamily: typography.fontFamily.display }}>Daily Attendance</h1>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: typography.fontSize.body, fontFamily: typography.fontFamily.body }}>Track labour or team attendance with accurate wage calculations.</p>
        </motion.div>

        {/* Selection Mode Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, ...animations.transition.smooth }}
          style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.xl }}
        >
          <button
            onClick={() => { setSelectionMode('labour'); setSelectedTeamId(''); setEntries({}); }}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.full,
              border: `2px solid ${selectionMode === 'labour' ? colors.primary : colors.border}`,
              background: selectionMode === 'labour' ? colors.primary : colors.card,
              color: selectionMode === 'labour' ? 'white' : colors.textPrimary,
              fontWeight: typography.fontWeight.semibold,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            👤 Individual Labour
          </button>
          <button
            onClick={() => { setSelectionMode('team'); setEntries({}); }}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.full,
              border: `2px solid ${selectionMode === 'team' ? colors.primary : colors.border}`,
              background: selectionMode === 'team' ? colors.primary : colors.card,
              color: selectionMode === 'team' ? 'white' : colors.textPrimary,
              fontWeight: typography.fontWeight.semibold,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            👥 Team
          </button>
        </motion.div>

        <label style={labelStyle}>Project</label>
        <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
          <option value="">-- Select Project --</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.customers?.name})</option>)}
        </select>

        <label style={labelStyle}>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />

        {/* Team Selection (only if team mode is active) */}
        {selectionMode === 'team' && (
          <>
            <label style={labelStyle}>Select Team</label>
            <select value={selectedTeamId} onChange={e => handleTeamSelect(e.target.value)} style={inputStyle}>
              <option value="">-- Select Team --</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </>
        )}

        {/* Attendance Marking */}
        {((selectionMode === 'labour' && labourList.length > 0) || (selectionMode === 'team' && selectedTeamId && teamMembers.length > 0)) && (
          <>
            <h3 style={{ color: colors.textPrimary, marginTop: spacing.xl, fontSize: typography.fontSize.h3, fontWeight: typography.fontWeight.semibold }}>
              {selectionMode === 'labour' ? 'Mark Labour Attendance' : 'Mark Team Attendance'}
            </h3>

            <motion.div
              initial="initial"
              animate="animate"
              variants={animations.variants.slideUp}
              transition={animations.transition.smooth}
            >
              {(selectionMode === 'labour' ? labourList : teamMembers).map((item, idx) => {
                const labour = selectionMode === 'labour' ? item : item.labour
                const labourId = selectionMode === 'labour' ? item.id : item.labour_id
                return (
                  <motion.div
                    key={labourId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, ...animations.transition.smooth }}
                    whileHover={{ y: -2 }}
                    style={{ ...cardStyle, marginBottom: spacing.lg }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.sm }}>
                          {labour?.name}
                        </div>
                        <div style={{ fontSize: typography.fontSize.caption, color: colors.textSecondary }}>
                          Rs. {labour?.daily_wage}/day
                        </div>
                      </div>
                      <select 
                        value={entries[labourId] || ''} 
                        onChange={e => setEntry(labourId, e.target.value)} 
                        style={{ ...inputStyle, margin: 0, marginBottom: 0 }}
                      >
                        <option value="">Not worked</option>
                        <option value="full">Full Day (1x)</option>
                        <option value="one_half">1.5 Day (1.5x)</option>
                        <option value="half">Half Day (0.5x)</option>
                      </select>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </>
        )}

        <motion.button
          onClick={saveAttendance}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ ...primaryBtnStyle, marginTop: spacing.lg }}
        >
          Save Attendance
        </motion.button>

        {/* Weekly Totals */}
        <h3 style={{ marginTop: spacing.xxxl, color: colors.textPrimary, fontSize: typography.fontSize.h3, fontWeight: typography.fontWeight.semibold }}>Last 7 Days — Payable per Labour</h3>
        <motion.div
          initial="initial"
          animate="animate"
          variants={animations.variants.slideUp}
          transition={animations.transition.smooth}
        >
          {weeklyTotals.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={cardStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: colors.textPrimary }}>{t.name}</strong>
                <span style={{ color: colors.primary, fontWeight: typography.fontWeight.semibold }}>Rs. {t.total.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}