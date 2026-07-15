'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getNextDocNumber } from '../../lib/docNumber'
import { generateQuotationPdf } from '../../lib/generateQuotationPdf'
import { companyInfo } from '../../lib/companyInfo'
import { inputStyle, primaryBtnStyle, secondaryBtnStyle, smallBtnStyle, dangerBtnStyle } from '../../lib/uiStyles'

const DEFAULT_TERMS = `1. 50% advance required to begin work, balance on completion.
2. Rates valid for 15 days from quotation date.
3. Any additional work outside this scope will be charged separately.
4. Material wastage/damage due to site conditions is not covered.`

export default function QuotationPage() {
  const [customerName, setCustomerName] = useState('')
  const [customerType, setCustomerType] = useState('individual')
  const [customerPhone, setCustomerPhone] = useState('')
  const [preparedBy, setPreparedBy] = useState('')
  const [workItems, setWorkItems] = useState([''])
  const [subtotal, setSubtotal] = useState('')
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [quotationNo, setQuotationNo] = useState(null)

  const addWorkItem = () => setWorkItems([...workItems, ''])
  const removeWorkItem = (idx) => setWorkItems(workItems.filter((_, i) => i !== idx))
  const updateWorkItem = (idx, value) => {
    const copy = [...workItems]
    copy[idx] = value
    setWorkItems(copy)
  }

  const handleGenerate = async () => {
    if (!customerName || !customerPhone || !preparedBy || !subtotal) {
      alert('Please fill customer name, phone, prepared by, and subtotal amount.')
      return
    }
    setLoading(true)
    try {
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert({ name: customerName, type: customerType, phone: customerPhone })
        .select()
        .single()
      if (custErr) throw custErr

      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({ customer_id: customer.id, title: customerName, status: 'quoted' })
        .select()
        .single()
      if (projErr) throw projErr

      const qNo = await getNextDocNumber('quotations', 'quotation_no', 'BG')

      const sub = parseFloat(subtotal)
      const cgst = sub * 0.09
      const sgst = sub * 0.09
      const grandTotal = sub + cgst + sgst

      const { error: quoteErr } = await supabase.from('quotations').insert({
        project_id: project.id,
        quotation_no: qNo,
        prepared_by: preparedBy,
        work_items: workItems.filter(w => w.trim() !== ''),
        subtotal: sub,
        cgst,
        sgst,
        grand_total: grandTotal,
        terms,
      })
      if (quoteErr) throw quoteErr

      const dateStr = new Date().toLocaleDateString('en-IN')
      const pdfBytes = await generateQuotationPdf({
        quotationNo: qNo,
        preparedBy,
        customerName,
        customerType,
        customerPhone,
        workItems: workItems.filter(w => w.trim() !== ''),
        subtotal: sub,
        cgst,
        sgst,
        grandTotal,
        terms,
        date: dateStr,
      })

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setPdfUrl(URL.createObjectURL(blob))
      setPdfBlob(blob)
      setQuotationNo(qNo)
    } catch (err) {
      console.error(err)
      alert('Something went wrong: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!pdfBlob || !quotationNo) return
    const file = new File([pdfBlob], `${quotationNo}.pdf`, { type: 'application/pdf' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `Quotation ${quotationNo}`, text: `Quotation ${quotationNo} from ${companyInfo.name}` })
      } catch (err) {
        console.log('Share cancelled', err)
      }
    } else {
      alert('Sharing not supported on this browser — use Download instead.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', padding: 24, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: companyInfo.themeColor, margin: '0 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>New Quotation</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Build polished proposals with a refined, premium workflow.</p>
        </div>

      <label>Customer Name</label>
      <input value={customerName} onChange={e => setCustomerName(e.target.value)} style={inputStyle} />

      <label>Customer Type</label>
      <select value={customerType} onChange={e => setCustomerType(e.target.value)} style={inputStyle}>
        <option value="individual">Individual</option>
        <option value="company">Company</option>
      </select>

      <label>Customer Phone</label>
      <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={inputStyle} />

      <label>Prepared By</label>
      <input value={preparedBy} onChange={e => setPreparedBy(e.target.value)} style={inputStyle} />

      <label>Work Items</label>
      {workItems.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={item} onChange={e => updateWorkItem(idx, e.target.value)} placeholder={`Work item ${idx + 1}`} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
          {workItems.length > 1 && <button onClick={() => removeWorkItem(idx)} style={dangerBtnStyle}>✕</button>}
        </div>
      ))}
      <button onClick={addWorkItem} style={smallBtnStyle}>+ Add work item</button>

      <label style={{ marginTop: 16, display: 'block' }}>Subtotal Amount (before GST) — Rs.</label>
      <input type="number" value={subtotal} onChange={e => setSubtotal(e.target.value)} style={inputStyle} />

      <label>Terms & Conditions</label>
      <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={6} style={inputStyle} />

      <button onClick={handleGenerate} disabled={loading || !customerName || !customerPhone || !preparedBy || !subtotal} style={{ ...primaryBtnStyle, marginTop: 16 }}>
        {loading ? 'Generating...' : 'Generate Quotation PDF'}
      </button>

      {pdfUrl && (
        <div style={{ marginTop: 20, padding: 18, background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)', borderRadius: 18, border: '1px solid #e5ebf2', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)' }}>
          <p style={{ fontWeight: 700, color: companyInfo.themeColor, marginBottom: 12 }}>Quotation {quotationNo} ready</p>
          <a href={pdfUrl} download={`${quotationNo}.pdf`} style={secondaryBtnStyle}>Download PDF</a>
          <button onClick={handleShare} style={{ ...primaryBtnStyle, background: 'linear-gradient(135deg, #25D366 0%, #1fbf5a 100%)', width: 'auto', marginTop: 10 }}>Share on WhatsApp</button>
        </div>
      )}
      </div>
    </div>
  )
}