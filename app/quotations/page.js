'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, labelStyle, primaryBtnStyle, cardStyle } from '../../lib/uiStyles'
import { colors, spacing, typography, shadows, borderRadius, animations } from '../../lib/designSystem'

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([])
  const [filter, setFilter] = useState('pending') // 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadQuotations()
  }, [])

  const loadQuotations = async () => {
    const { data } = await supabase
      .from('quotations')
      .select('*, customers(name, phone, type)')
      .order('created_at', { ascending: false })
    setQuotations(data || [])
  }

  const updateStatus = async (id, status) => {
    setLoading(true)
    const { error } = await supabase.from('quotations').update({ status }).eq('id', id)
    setLoading(false)
    if (error) {
      alert(error.message)
      return
    }
    loadQuotations()
  }

  const convertToProject = async (quotation) => {
    setLoading(true)
    try {
      // Create project from quotation
      const { error: projInsertErr } = await supabase
        .from('projects')
        .insert({
          customer_id: quotation.customer_id,
          title: quotation.customers.name,
          quoted_price: quotation.grand_total,
          status: 'ongoing',
        })
      if (projInsertErr) throw projInsertErr

      // Fetch the project we just inserted
      const { data: projects, error: projFetchErr } = await supabase
        .from('projects')
        .select('id')
        .eq('title', quotation.customers.name)
        .eq('customer_id', quotation.customer_id)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (projFetchErr) throw projFetchErr
      if (!projects || projects.length === 0) throw new Error('Failed to get project ID')
      
      const project = projects[0]

      // Link quotation to project
      const { error: linkErr } = await supabase.from('quotations').update({ project_id: project.id }).eq('id', quotation.id)
      if (linkErr) throw linkErr

      setLoading(false)
      loadQuotations()
      alert('Quotation converted to project!')
    } catch (err) {
      setLoading(false)
      alert(err.message)
    }
  }

  const filteredQuotations = quotations.filter(q => q.status === filter)

  const getStatusColor = (status) => {
    if (status === 'pending') return '#FFA500'
    if (status === 'approved') return '#22C55E'
    if (status === 'rejected') return '#EF4444'
    return colors.textSecondary
  }

  const getStatusLabel = (status) => {
    if (status === 'pending') return '⏳ Pending'
    if (status === 'approved') return '✅ Approved'
    if (status === 'rejected') return '❌ Rejected'
    return status
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
          <h1 style={{ color: colors.textPrimary, margin: `0 0 ${spacing.md} 0`, fontSize: typography.fontSize.h2, fontWeight: typography.fontWeight.extrabold, letterSpacing: '-0.02em', fontFamily: typography.fontFamily.display }}>Quotations</h1>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: typography.fontSize.body, fontFamily: typography.fontFamily.body }}>Manage quotations and convert approved ones to projects.</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, ...animations.transition.smooth }}
          style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.xl, flexWrap: 'wrap' }}
        >
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderRadius: borderRadius.full,
                border: `2px solid ${filter === status ? getStatusColor(status) : colors.border}`,
                background: filter === status ? getStatusColor(status) : colors.card,
                color: filter === status ? 'white' : colors.textPrimary,
                fontWeight: typography.fontWeight.semibold,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'capitalize',
              }}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </motion.div>

        {/* Quotations List */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={animations.variants.slideUp}
          transition={animations.transition.smooth}
        >
          {filteredQuotations.length === 0 ? (
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
              No {filter} quotations
            </motion.div>
          ) : (
            filteredQuotations.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, ...animations.transition.smooth }}
                whileHover={{ y: -2 }}
                style={{ ...cardStyle, marginBottom: spacing.lg }}
              >
                <div style={{ marginBottom: spacing.lg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: typography.fontWeight.extrabold, color: colors.textPrimary, fontSize: typography.fontSize.h3, marginBottom: spacing.sm }}>
                        {q.quotation_no}
                      </div>
                      <div style={{ fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.xs }}>
                        {q.customers?.name}
                      </div>
                      <div style={{ fontSize: typography.fontSize.caption, color: colors.textSecondary }}>
                        {q.customers?.phone} • {q.customers?.type}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: typography.fontWeight.semibold, color: colors.primary, fontSize: typography.fontSize.h3, marginBottom: spacing.sm }}>
                        Rs. {parseFloat(q.grand_total || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: typography.fontSize.caption, color: getStatusColor(q.status), fontWeight: typography.fontWeight.semibold }}>
                        {getStatusLabel(q.status)}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: typography.fontSize.caption, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 1.6 }}>
                    <strong>Work:</strong> {Array.isArray(q.work_items) ? q.work_items.join(', ') : 'N/A'}
                  </div>

                  {q.status === 'pending' && (
                    <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
                      <motion.button
                        onClick={() => updateStatus(q.id, 'approved')}
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: `${spacing.md} ${spacing.lg}`,
                          borderRadius: borderRadius.lg,
                          border: 'none',
                          background: '#22C55E',
                          color: 'white',
                          fontWeight: typography.fontWeight.semibold,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                          fontSize: typography.fontSize.caption,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        ✅ Approve
                      </motion.button>
                      <motion.button
                        onClick={() => updateStatus(q.id, 'rejected')}
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: `${spacing.md} ${spacing.lg}`,
                          borderRadius: borderRadius.lg,
                          border: 'none',
                          background: '#EF4444',
                          color: 'white',
                          fontWeight: typography.fontWeight.semibold,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                          fontSize: typography.fontSize.caption,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        ❌ Reject
                      </motion.button>
                    </div>
                  )}

                  {q.status === 'approved' && !q.project_id && (
                    <motion.button
                      onClick={() => convertToProject(q)}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        ...primaryBtnStyle,
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      🚀 Convert to Project
                    </motion.button>
                  )}

                  {q.project_id && (
                    <div style={{ fontSize: typography.fontSize.caption, color: colors.primary, fontWeight: typography.fontWeight.semibold }}>
                      ✓ Added to Projects
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
