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
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', background: '#f5f7fb', padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <img src={companyInfo.logo} alt="logo" style={{ width: 120, marginBottom: 10 }} />
        <h1 style={{ color: companyInfo.themeColor, marginBottom: 4 }}>{companyInfo.name}</h1>
        <p style={{ color: '#666' }}>{companyInfo.tagline}</p>
      </div>
      <div style={{ maxWidth: 500, margin: '0 auto', display: 'grid', gap: 12 }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{
            display: 'block', background: 'white', border: `1px solid ${companyInfo.themeColor}22`,
            color: companyInfo.themeColor, padding: '16px 20px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}