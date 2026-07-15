// Apple-Inspired Premium Design System

export const colors = {
  // Primary
  primary: '#FF6A3D',
  primaryDark: '#E55A2B',
  
  // Secondary
  secondary: '#0F2F66',
  
  // Background
  background: '#FFFAF5',
  backgroundDark: '#F9F5F0',
  
  // Cards
  card: '#FFFFFF',
  cardHover: '#FAFAF8',
  
  // Text
  textPrimary: '#111111',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Border
  border: 'rgba(0, 0, 0, 0.06)',
  borderLight: 'rgba(0, 0, 0, 0.03)',
  
  // Accents
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#0A84FF',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #FF6A3D 0%, #FF8659 100%)',
  gradientSubtle: 'linear-gradient(135deg, #FFFAF5 0%, #FAF5F0 100%)',
}

// Spacing System (8px base)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
}

// Typography
export const typography = {
  fontFamily: {
    display: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  
  fontSize: {
    hero: '64px',
    h1: '40px',
    h2: '30px',
    h3: '24px',
    h4: '20px',
    body: '16px',
    caption: '14px',
    small: '12px',
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
}

// Shadows (Premium)
export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 12px 32px rgba(0, 0, 0, 0.12)',
  xl: '0 20px 48px rgba(0, 0, 0, 0.15)',
  glow: '0 0 32px rgba(255, 106, 61, 0.1)',
  inner: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
}

// Border Radius
export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '999px',
}

// Animation Presets
export const animations = {
  transition: {
    subtle: { duration: 0.2, ease: 'easeInOut' },
    smooth: { duration: 0.3, ease: 'easeInOut' },
    elegant: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    bouncy: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
  
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  },
}

// Component Styles
export const components = {
  button: {
    base: {
      fontFamily: typography.fontFamily.body,
      fontSize: typography.fontSize.body,
      fontWeight: typography.fontWeight.semibold,
      borderRadius: borderRadius.full,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    primary: {
      background: colors.primary,
      color: 'white',
      padding: `${spacing.md} ${spacing.xl}`,
      boxShadow: shadows.md,
    },
    secondary: {
      background: colors.card,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
      padding: `${spacing.md} ${spacing.xl}`,
    },
    small: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.fontSize.caption,
    },
  },
  
  input: {
    base: {
      fontFamily: typography.fontFamily.body,
      fontSize: typography.fontSize.body,
      padding: `${spacing.md} ${spacing.lg}`,
      borderRadius: borderRadius.md,
      border: `1px solid ${colors.border}`,
      background: colors.background,
      color: colors.textPrimary,
      transition: 'all 0.3s ease',
      outline: 'none',
      
      '&:focus': {
        borderColor: colors.primary,
        boxShadow: `0 0 0 3px rgba(255, 106, 61, 0.1)`,
        background: colors.card,
      },
    },
  },
  
  card: {
    base: {
      background: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      boxShadow: shadows.sm,
      border: `1px solid ${colors.border}`,
      transition: 'all 0.3s ease',
    },
  },
}

// Gradient Overlays
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
  subtle: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
  glass: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)`,
}
