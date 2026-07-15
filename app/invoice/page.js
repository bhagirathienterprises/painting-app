'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getNextDocNumber } from '../../lib/docNumber'
import { generateInvoicePdf } from '../../lib/generateInvoicePdf'
import { companyInfo } from '../../lib/companyInfo'
import { inputStyle, primaryBtnStyle, secondaryBtnStyle } from '../../lib/uiStyles'

export default function InvoicePage() {
  const [quotations, setQuotations] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [subtotal, setSubtotal] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [invoiceNo, setInvoiceNo] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('quotations').select('*, projects(*, customers(*))').order('created_at', { ascending: false })
      setQuotations(data || [])
    }
    load()
  }, [])

  const selected = quotations.find(q => q.id === selectedId)

  useEffect(() => { if (selected) setSubtotal(String(selected.subtotal)) }, [selectedId])

  const handleGenerate = async () => {
    if (!selected || !subtotal) { alert('Select a quotation and confirm the amount.'); return }
    setLoading(true)
    try {
      const invNo = await getNextDocNumber('invoices', 'invoice_no', 'INV')
      const sub = parseFloat(subtotal)
      const cgst = sub * 0.09
      const sgst = sub * 0.09
      const grandTotal = sub + cgst + sgst

      const { error: invErr } = await supabase.from('invoices').insert({
        project_id: selected.project_id, invoice_no: invNo, subtotal: sub, cgst, sgst, grand_total: grandTotal,
      })
      if (invErr) throw invErr

      await supabase.from('projects').update({ status: 'completed' }).eq('id', selected.project_id)

      const dateStr = new Date().toLocaleDateString('en-IN')
      const pdfBytes = await generateInvoicePdf({
        invoiceNo: invNo,
        customerName: selected.projects.customers.name,
        customerType: selected.projects.customers.type,
        customerPhone: selected.projects.customers.phone,
        workItems: selected.work_items,
        subtotal: sub, cgst, sgst, grandTotal, date: dateStr,
      })

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setPdfUrl(URL.createObjectURL(blob))
      setPdfBlob(blob)
      setInvoiceNo(invNo)
    } catch (err) {
      console.error(err)
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!pdfBlob || !invoiceNo) return
    const file = new File([pdfBlob], `${invoiceNo}.pdf`, { type: 'application/pdf' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Invoice ${invoiceNo}` })
    } else {
      alert('Sharing not supported here — use Download instead.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', padding: 24, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: companyInfo.themeColor, margin: '0 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>New Sales Invoice</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Turn completed work into a polished invoice in seconds.</p>
        </div>

      <label>Select Quotation / Project</label>
      <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={inputStyle}>
        <option value="">-- Select --</option>
        {quotations.map(q => <option key={q.id} value={q.id}>{q.quotation_no} — {q.projects?.customers?.name}</option>)}
      </select>

      {selected && (
        <>
          <label>Final Amount (before GST) — Rs.</label>
          <input type="number" value={subtotal} onChange={e => setSubtotal(e.target.value)} style={inputStyle} />
          <p style={{ fontSize: 13, color: '#666' }}>Pulled from quotation {selected.quotation_no}. Adjust if the final work differed from the quote.</p>
        </>
      )}

      <button onClick={handleGenerate} disabled={loading || !selected} style={primaryBtnStyle}>
        {loading ? 'Generating...' : 'Generate Invoice PDF'}
      </button>

      {pdfUrl && (
        <div style={{ marginTop: 20, padding: 18, background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)', borderRadius: 18, border: '1px solid #e5ebf2', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)' }}>
          <p style={{ fontWeight: 700, color: companyInfo.themeColor, marginBottom: 12 }}>Invoice {invoiceNo} ready</p>
          <a href={pdfUrl} download={`${invoiceNo}.pdf`} style={secondaryBtnStyle}>Download PDF</a>
          <button onClick={handleShare} style={{ ...primaryBtnStyle, background: 'linear-gradient(135deg, #25D366 0%, #1fbf5a 100%)', width: 'auto', marginTop: 10 }}>Share on WhatsApp</button>
        </div>
      )}
      </div>
    </div>
  )
}