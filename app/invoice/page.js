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
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: companyInfo.themeColor }}>New Sales Invoice</h1>

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
        <div style={{ marginTop: 20, padding: 16, background: '#f0f4fa', borderRadius: 8 }}>
          <p style={{ fontWeight: 'bold', color: companyInfo.themeColor }}>Invoice {invoiceNo} ready</p>
          <a href={pdfUrl} download={`${invoiceNo}.pdf`} style={secondaryBtnStyle}>Download PDF</a>
          <button onClick={handleShare} style={{ ...primaryBtnStyle, background: '#25D366', marginTop: 8 }}>Share on WhatsApp</button>
        </div>
      )}
    </div>
  )
}