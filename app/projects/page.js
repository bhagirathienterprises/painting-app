'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, labelStyle, primaryBtnStyle, cardStyle } from '../../lib/uiStyles'
import { colors, spacing, typography, shadows, borderRadius, animations } from '../../lib/designSystem'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [quotedPrice, setQuotedPrice] = useState('')
  const [place, setPlace] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    setProjects(data || [])
  }

  const addProject = async () => {
    if (!title.trim()) {
      alert('Enter project name')
      return
    }
    if (!quotedPrice || isNaN(quotedPrice)) {
      alert('Enter valid quoted price')
      return
    }
    if (!place.trim()) {
      alert('Enter project location')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('projects').insert([
      {
        title,
        quoted_price: parseFloat(quotedPrice),
        place,
      },
    ])
    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setTitle('')
    setQuotedPrice('')
    setPlace('')
    loadProjects()
    alert('Project added successfully!')
  }

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    loadProjects()
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
          <h1 style={{ color: colors.textPrimary, margin: `0 0 ${spacing.md} 0`, fontSize: typography.fontSize.h2, fontWeight: typography.fontWeight.extrabold, letterSpacing: '-0.02em', fontFamily: typography.fontFamily.display }}>Projects</h1>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: typography.fontSize.body, fontFamily: typography.fontFamily.body }}>Add and manage your painting projects manually.</p>
        </motion.div>

        {/* Add Project Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...animations.transition.smooth }}
          style={{ ...cardStyle, marginBottom: spacing.xl }}
        >
          <h3 style={{ color: colors.textPrimary, marginTop: 0, fontSize: typography.fontSize.h3, fontWeight: typography.fontWeight.semibold }}>Add New Project</h3>

          <label style={labelStyle}>Project Name</label>
          <input
            type="text"
            placeholder="e.g., Office Painting"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Quoted Price (Rs.)</label>
          <input
            type="number"
            placeholder="e.g., 50000"
            value={quotedPrice}
            onChange={e => setQuotedPrice(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Location / Place</label>
          <input
            type="text"
            placeholder="e.g., Downtown, City Center"
            value={place}
            onChange={e => setPlace(e.target.value)}
            style={inputStyle}
          />

          <motion.button
            onClick={addProject}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...primaryBtnStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Adding...' : 'Add Project'}
          </motion.button>
        </motion.div>

        {/* Projects List */}
        <h3 style={{ color: colors.textPrimary, marginTop: spacing.xxxl, fontSize: typography.fontSize.h3, fontWeight: typography.fontWeight.semibold }}>Projects</h3>
        <motion.div
          initial="initial"
          animate="animate"
          variants={animations.variants.slideUp}
          transition={animations.transition.smooth}
        >
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: spacing.xl,
                textAlign: 'center',
                color: colors.textSecondary,
                fontSize: typography.fontSize.body,
              }}
            >
              No projects yet. Add one above!
            </motion.div>
          ) : (
            projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, ...animations.transition.smooth }}
                whileHover={{ y: -2 }}
                style={{ ...cardStyle, marginBottom: spacing.lg }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.lg }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.sm }}>
                      {project.title}
                    </div>
                    <div style={{ fontSize: typography.fontSize.caption, color: colors.textSecondary, marginBottom: spacing.sm }}>
                      📍 {project.place}
                    </div>
                    <div style={{ fontSize: typography.fontSize.caption, color: colors.primary, fontWeight: typography.fontWeight.semibold }}>
                      Rs. {parseFloat(project.quoted_price || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <motion.button
                    onClick={() => deleteProject(project.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      borderRadius: borderRadius.lg,
                      border: 'none',
                      background: '#FF4444',
                      color: 'white',
                      fontWeight: typography.fontWeight.semibold,
                      cursor: 'pointer',
                      fontSize: typography.fontSize.caption,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
