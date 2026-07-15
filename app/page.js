import Link from 'next/link'
import { companyInfo } from '../lib/companyInfo'

const links = [
  { href: '/quotation', label: 'New Quotation' },
  { href: '/invoice', label: 'New Sales Invoice' },
  { href: '/labour', label: 'Labour & Teams' },
  { href: '/attendance', label: 'Daily Attendance' },
  { href: '/work-orders', label: 'Work Orders' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/gst', label: 'GST Tracker' },
]

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', padding: 24 }}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, borderRadius: 30, background: 'white', boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)', marginBottom: 16 }}>
            <img src={companyInfo.logo} alt="logo" style={{ width: 70, height: 70, objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: companyInfo.themeColor, marginBottom: 6, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{companyInfo.name}</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 15 }}>{companyInfo.tagline}</p>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', border: '1px solid #e5ebf2',
              color: '#0f172a', padding: '16px 18px', borderRadius: 16, textDecoration: 'none', fontWeight: 600,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)', backdropFilter: 'blur(10px)',
            }}>
              <span>{l.label}</span>
              <span style={{ color: companyInfo.themeColor, fontSize: 18 }}>›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}