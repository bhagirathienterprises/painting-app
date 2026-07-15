import { colors, spacing, typography, shadows, borderRadius, gradients } from './designSystem'

export const inputStyle = {
  display: 'block',
  width: '100%',
  padding: `${spacing.md} ${spacing.lg}`,
  marginTop: spacing.md,
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
}

export const labelStyle = {
  display: 'block',
  fontWeight: typography.fontWeight.semibold,
  color: colors.textPrimary,
  fontSize: typography.fontSize.body,
  marginTop: spacing.lg,
  marginBottom: spacing.md,
  fontFamily: typography.fontFamily.body,
}

export const primaryBtnStyle = {
  background: gradients.primary,
  color: 'white',
  border: 'none',
  padding: `${spacing.md} ${spacing.xl}`,
  borderRadius: borderRadius.full,
  cursor: 'pointer',
  width: '100%',
  fontSize: typography.fontSize.body,
  fontWeight: typography.fontWeight.semibold,
  marginTop: spacing.lg,
  boxShadow: shadows.lg,
  fontFamily: typography.fontFamily.body,
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
}

export const secondaryBtnStyle = {
  display: 'inline-block',
  background: colors.card,
  color: colors.textPrimary,
  padding: `${spacing.md} ${spacing.lg}`,
  borderRadius: borderRadius.full,
  textDecoration: 'none',
  marginRight: spacing.lg,
  fontWeight: typography.fontWeight.semibold,
  border: `1px solid ${colors.border}`,
  fontFamily: typography.fontFamily.body,
  fontSize: typography.fontSize.body,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
}

export const smallBtnStyle = {
  background: colors.backgroundDark,
  color: colors.textPrimary,
  border: `1px solid ${colors.border}`,
  padding: `${spacing.sm} ${spacing.md}`,
  borderRadius: borderRadius.full,
  cursor: 'pointer',
  fontWeight: typography.fontWeight.semibold,
  fontFamily: typography.fontFamily.body,
  fontSize: typography.fontSize.caption,
  transition: 'all 0.3s ease',
}

export const dangerBtnStyle = {
  background: '#FFF1F2',
  color: '#BE123C',
  border: `1px solid #FECDD3`,
  borderRadius: borderRadius.full,
  padding: `${spacing.sm} ${spacing.md}`,
  cursor: 'pointer',
  fontWeight: typography.fontWeight.semibold,
  fontFamily: typography.fontFamily.body,
  fontSize: typography.fontSize.caption,
  transition: 'all 0.3s ease',
}

export const cardStyle = {
  background: colors.card,
  borderRadius: borderRadius.lg,
  padding: spacing.xl,
  marginBottom: spacing.lg,
  boxShadow: shadows.md,
  border: `1px solid ${colors.border}`,
  transition: 'all 0.3s ease',
  fontFamily: typography.fontFamily.body,
}