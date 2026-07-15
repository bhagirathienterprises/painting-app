'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, primaryBtnStyle, cardStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

export default function GstPage() {
  const [outgoing, setOutgoing] = useState(0)
  const [incoming, setIncoming] = useState(0)
  const [purchases, setPurchases] = useState([])
  const [supplierName, setSupplierName] = useState('')
  const [supplierGstin, setSupplierGstin] = useState('')
  const [amount, setAmount] = useState('')

  const loadTotals = async () => {
    const { data: invoices } = await supabase.from('invoices').select('cgst, sgst')
    const { data: purchaseData } = await supabase.from('purchases').select('*').order('created_at', { ascending: false })
    const out = (invoices || []).reduce((s, i) => s + i.cgst + i.sgst, 0)
    const inc = (purchaseData || []).reduce((s, p) => s + p.cgst + p.sgst, 0)
    setOutgoing(out)
    setIncoming(inc)
    setPurchases(purchaseData || [])
  }

  useEffect(() => { loadTotals() }, [])

  const addPurchase = async () => {
    if (!supplierName || !amount) { alert('Supplier name and amount required'); return }
    const amt = parseFloat(amount)
    const cgst = amt * 0.09
    const sgst = amt * 0.09
    await supabase.from('purchases').insert({ supplier_name: supplierName, supplier_gstin: supplierGstin, amount: amt, cgst, sgst })
    setSupplierName(''); setSupplierGstin(''); setAmount('')
    loadTotals()
  }

  const net = outgoing - incoming

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', padding: 24, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: companyInfo.themeColor, margin: '0 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>GST Tracker</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Stay on top of incoming and outgoing obligations.</p>
        </div>

      <div style={cardStyle}>
        <p>Outgoing GST (from sales invoices): <strong>Rs. {outgoing.toFixed(2)}</strong></p>
        <p>Incoming GST (from purchases): <strong>Rs. {incoming.toFixed(2)}</strong></p>
        <p>Net GST Payable: <strong style={{ color: net >= 0 ? '#c0392b' : '#27ae60' }}>Rs. {Math.abs(net).toFixed(2)} {net >= 0 ? '(payable)' : '(credit)'}</strong></p>
      </div>

      <div style={cardStyle}>
        <h3>Log a Material Purchase (for incoming GST)</h3>
        <input placeholder="Supplier Name" value={supplierName} onChange={e => setSupplierName(e.target.value)} style={inputStyle} />
        <input placeholder="Supplier GSTIN" value={supplierGstin} onChange={e => setSupplierGstin(e.target.value)} style={inputStyle} />
        <input placeholder="Purchase Amount (before GST)" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
        <button onClick={addPurchase} style={primaryBtnStyle}>Add Purchase</button>
      </div>

      <h3>Recent Purchases</h3>
      {purchases.map(p => <div key={p.id} style={cardStyle}>{p.supplier_name} — Rs. {p.amount} (GST: Rs. {(p.cgst + p.sgst).toFixed(2)})</div>)}
      </div>
    </div>
  )
}