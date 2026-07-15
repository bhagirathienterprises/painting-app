'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { companyInfo } from '../lib/companyInfo'
import { colors, spacing, typography, shadows, borderRadius, animations } from '../lib/designSystem'

const links = [
  { href: '/quotation', label: 'New Quotation', icon: '📋' },
  { href: '/invoice', label: 'New Sales Invoice', icon: '💳' },
  { href: '/labour', label: 'Labour & Teams', icon: '👥' },
  { href: '/attendance', label: 'Daily Attendance', icon: '📅' },
  { href: '/work-orders', label: 'Work Orders', icon: '📝' },
  { href: '/inventory', label: 'Inventory', icon: '📦' },
  { href: '/expenses', label: 'Expenses', icon: '💰' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/gst', label: 'GST Tracker', icon: '🧾' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
        padding: spacing.xxxl,
        fontFamily: typography.fontFamily.body,
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto', paddingTop: spacing.xl }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animations.transition.elegant}
          style={{ textAlign: 'center', marginBottom: spacing.xxxl }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, ...animations.transition.elegant }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '96px',
              height: '96px',
              borderRadius: borderRadius.xxl,
              background: colors.card,
              boxShadow: shadows.lg,
              marginBottom: spacing.xl,
            }}
          >
            <img src={companyInfo.logo} alt="logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, ...animations.transition.elegant }}
            style={{
              color: colors.textPrimary,
              marginBottom: spacing.md,
              fontSize: typography.fontSize.h1,
              fontWeight: typography.fontWeight.extrabold,
              letterSpacing: '-0.02em',
              fontFamily: typography.fontFamily.display,
            }}
          >
            {companyInfo.name}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, ...animations.transition.elegant }}
            style={{
              color: colors.textSecondary,
              margin: 0,
              fontSize: typography.fontSize.body,
              fontFamily: typography.fontFamily.body,
            }}
          >
            {companyInfo.tagline}
          </motion.p>
        </motion.div>

        {/* Links Grid */}
        <motion.div
          variants={containerVariants}
          style={{ display: 'grid', gap: spacing.lg }}
        >
          {links.map((l, idx) => (
            <motion.div key={l.href} variants={itemVariants}>
              <Link href={l.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: shadows.xl }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                    padding: `${spacing.lg} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    textDecoration: 'none',
                    fontWeight: typography.fontWeight.semibold,
                    boxShadow: shadows.md,
                    backdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
                    <span style={{ fontSize: '24px' }}>{l.icon}</span>
                    <span>{l.label}</span>
                  </div>
                  <span style={{ color: colors.primary, fontSize: '20px' }}>›</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}