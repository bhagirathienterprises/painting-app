'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { inputStyle, primaryBtnStyle, cardStyle } from '../../lib/uiStyles'
import { companyInfo } from '../../lib/companyInfo'

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [type, setType] = useState('material')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')
  const [usageItem, setUsageItem] = useState('')
  const [usageProject, setUsageProject] = useState('')
  const [usageQty, setUsageQty] = useState('')

  const loadItems = async () => {
    const { data } = await supabase.from('inventory_items').select('*').order('name')
    setItems(data || [])
  }
  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*, customers(name)').order('created_at', { ascending: false })
    setProjects(data || [])
  }
  useEffect(() => { loadItems(); loadProjects() }, [])

  const addItem = async () => {
    if (!name) { alert('Item name required'); return }
    await supabase.from('inventory_items').insert({ name, type, stock_qty: parseFloat(qty) || 0, unit })
    setName(''); setQty(''); setUnit('')
    loadItems()
  }

  const logUsage = async () => {
    if (!usageItem || !usageProject || !usageQty) { alert('Fill all usage fields'); return }
    const item = items.find(i => i.id === usageItem)
    if (parseFloat(usageQty) > item.stock_qty) { alert('Not enough stock left'); return }
    await supabase.from('inventory_usage').insert({ item_id: usageItem, project_id: usageProject, qty_used: parseFloat(usageQty) })
    await supabase.from('inventory_items').update({ stock_qty: item.stock_qty - parseFloat(usageQty) }).eq('id', usageItem)
    setUsageItem(''); setUsageProject(''); setUsageQty('')
    loadItems()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', padding: 24, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: companyInfo.themeColor, margin: '0 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Inventory Tracker</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Manage materials and usage without the clutter.</p>
        </div>

      <div style={cardStyle}>
        <h3>Add Item</h3>
        <input placeholder="Item name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
          <option value="material">Material</option>
          <option value="tool">Tool</option>
          <option value="equipment">Equipment</option>
        </select>
        <input placeholder="Starting Quantity" type="number" value={qty} onChange={e => setQty(e.target.value)} style={inputStyle} />
        <input placeholder="Unit (kg, ltr, pcs)" value={unit} onChange={e => setUnit(e.target.value)} style={inputStyle} />
        <button onClick={addItem} style={primaryBtnStyle}>Add Item</button>
      </div>

      <div style={cardStyle}>
        <h3>Log Usage on a Project</h3>
        <select value={usageItem} onChange={e => setUsageItem(e.target.value)} style={inputStyle}>
          <option value="">-- Select Item --</option>
          {items.map(i => <option key={i.id} value={i.id}>{i.name} (stock: {i.stock_qty} {i.unit})</option>)}
        </select>
        <select value={usageProject} onChange={e => setUsageProject(e.target.value)} style={inputStyle}>
          <option value="">-- Select Project --</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.customers?.name})</option>)}
        </select>
        <input placeholder="Quantity used" type="number" value={usageQty} onChange={e => setUsageQty(e.target.value)} style={inputStyle} />
        <button onClick={logUsage} style={primaryBtnStyle}>Log Usage</button>
      </div>

      <h3>Current Stock</h3>
      {items.map(i => (
        <div key={i.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between' }}>
          <span>{i.name} <span style={{ color: '#888', fontSize: 12 }}>({i.type})</span></span>
          <strong style={{ color: i.stock_qty < 5 ? '#c0392b' : '#222' }}>{i.stock_qty} {i.unit}</strong>
        </div>
      ))}
      </div>
    </div>
  )
}