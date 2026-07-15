'use client'

import { motion } from 'framer-motion'
import { colors, spacing, typography, shadows, borderRadius, animations } from './designSystem'

// Animated Page Container
export const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={animations.variants.fadeIn}
    transition={animations.transition.smooth}
    style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
      padding: spacing.xxxl,
      fontFamily: typography.fontFamily.body,
    }}
  >
    {children}
  </motion.div>
)

// Animated Container
export const AnimatedContainer = ({ children, className = '' }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={animations.variants.slideUp}
    transition={animations.transition.elegant}
    className={className}
    style={{
      maxWidth: '760px',
      margin: '0 auto',
      padding: `${spacing.xxl} ${spacing.lg}`,
    }}
  >
    {children}
  </motion.div>
)

// Animated Button
export const AnimatedButton = ({ onClick, children, variant = 'primary', disabled = false, loading = false, ...props }) => {
  const getStyle = () => {
    if (variant === 'primary') {
      return {
        background: gradients.primary,
        color: 'white',
        boxShadow: shadows.lg,
      }
    }
    if (variant === 'secondary') {
      return {
        background: colors.card,
        color: colors.textPrimary,
        border: `1px solid ${colors.border}`,
      }
    }
    if (variant === 'danger') {
      return {
        background: '#FFF1F2',
        color: '#BE123C',
        border: `1px solid #FECDD3`,
      }
    }
    return {}
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02, boxShadow: disabled ? shadows.lg : shadows.xl }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={animations.transition.smooth}
      style={{
        padding: `${spacing.md} ${spacing.xl}`,
        borderRadius: borderRadius.full,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.body,
        fontFamily: typography.fontFamily.body,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.3s ease',
        width: variant === 'primary' ? '100%' : 'auto',
        ...getStyle(),
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </motion.button>
  )
}

// Animated Card
export const AnimatedCard = ({ children, className = '', ...props }) => (
  <motion.div
    initial="initial"
    whileInView="animate"
    viewport={{ once: true, amount: 0.3 }}
    variants={animations.variants.slideUp}
    transition={animations.transition.elegant}
    whileHover={{ y: -4, boxShadow: shadows.xl }}
    style={{
      background: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      boxShadow: shadows.md,
      border: `1px solid ${colors.border}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
)

// Animated Input
export const AnimatedInput = ({ label, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={animations.transition.smooth}
  >
    {label && (
      <label style={{
        display: 'block',
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        fontSize: typography.fontSize.body,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        fontFamily: typography.fontFamily.body,
      }}>
        {label}
      </label>
    )}
    <motion.input
      whileFocus={{ scale: 1.01 }}
      transition={animations.transition.smooth}
      style={{
        display: 'block',
        width: '100%',
        padding: `${spacing.md} ${spacing.lg}`,
        marginBottom: spacing.lg,
        border: `1px solid ${colors.border}`,
        borderRadius: borderRadius.md,
        boxSizing: 'border-box',
        fontSize: typography.fontSize.body,
        fontFamily: typography.fontFamily.body,
        background: colors.background,
        color: colors.textPrimary,
        outline: 'none',
        transition: 'all 0.3s ease',
      }}
      {...props}
    />
  </motion.div>
)

// Animated Hero Section
export const AnimatedHero = ({ title, subtitle, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={animations.transition.elegant}
    style={{
      textAlign: 'center',
      marginBottom: spacing.xxxl,
    }}
  >
    <motion.h1
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, ...animations.transition.elegant }}
      style={{
        color: colors.textPrimary,
        margin: `0 0 ${spacing.md} 0`,
        fontSize: typography.fontSize.h1,
        fontWeight: typography.fontWeight.extrabold,
        letterSpacing: '-0.02em',
        fontFamily: typography.fontFamily.display,
      }}
    >
      {title}
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, ...animations.transition.elegant }}
      style={{
        color: colors.textSecondary,
        margin: 0,
        fontSize: typography.fontSize.body,
        fontFamily: typography.fontFamily.body,
      }}
    >
      {subtitle}
    </motion.p>
    {children}
  </motion.div>
)

// Animated List Container
export const AnimatedList = ({ children, staggerDelay = 0.05 }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={{
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
  >
    {children}
  </motion.div>
)

// Export design system for use in components
export { colors, spacing, typography, shadows, borderRadius, animations }
