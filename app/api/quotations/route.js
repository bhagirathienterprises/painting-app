import { NextResponse } from 'next/server'
import { getAdminClient } from '../../../lib/supabaseAdmin'

export async function POST(request) {
  try {
    const body = await request.json()
    const admin = getAdminClient()

    if (!admin) {
      return NextResponse.json({ error: 'Missing Supabase admin credentials' }, { status: 500 })
    }

   const { data: customer, error: customerError } = await admin
      .from('customers')
      .insert({
        name: body.customerName,
        type: body.customerType,
        phone: body.customerPhone,
      })
      .select()
      .single()

    if (customerError) {
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    const { data: project, error: projectError } = await admin
      .from('projects')
      .insert({
        customer_id: customer.id,
        title: body.customerName,
        status: 'quoted',
      })
      .select()
      .single()

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 })
    }

    const quotationInsert = await admin.from('quotations').insert({
      project_id: project.id,
      quotation_no: body.quotationNo,
      prepared_by: body.preparedBy,
      work_items: body.workItems || [],
      subtotal: body.subtotal,
      cgst: body.cgst,
      sgst: body.sgst,
      grand_total: body.grand_total,
      terms: body.terms,
      status: body.status || 'pending',
      customer_name: body.customerName,
      customer_type: body.customerType,
      customer_phone: body.customerPhone,
    })

    if (quotationInsert.error) {
      return NextResponse.json({ error: quotationInsert.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
