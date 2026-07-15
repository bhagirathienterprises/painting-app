import { createPdfWithHeader, drawFooter, wrapText, NAVY, GRAY, LIGHT_GRAY, WHITE, BLACK } from './pdfShared'

export async function generateQuotationPdf({ quotationNo, preparedBy, customerName, customerType, customerPhone, workItems, subtotal, cgst, sgst, grandTotal, terms, date }) {
  const { pdfDoc, page, font, fontBold, width, y: startY } = await createPdfWithHeader('QUOTATION', quotationNo)
  let y = startY

  page.drawText('To:', { x: 40, y, size: 10, font: fontBold, color: NAVY })
  y -= 15
  page.drawText(customerName + (customerType ? `  (${customerType})` : ''), { x: 40, y, size: 11, font: fontBold, color: BLACK })
  y -= 14
  page.drawText(`Phone: ${customerPhone}`, { x: 40, y, size: 10, font, color: GRAY })

  let yRight = y + 29
  const dateText = `Date: ${date}`
  page.drawText(dateText, { x: width - 40 - font.widthOfTextAtSize(dateText, 10), y: yRight, size: 10, font, color: GRAY })
  yRight -= 14
  const prepText = `Prepared by: ${preparedBy}`
  page.drawText(prepText, { x: width - 40 - font.widthOfTextAtSize(prepText, 10), y: yRight, size: 10, font, color: GRAY })

  y -= 35

  const tableX = 40
  const tableWidth = width - 80
  page.drawRectangle({ x: tableX, y: y - 22, width: tableWidth, height: 22, color: NAVY })
  page.drawText('S.No', { x: tableX + 8, y: y - 16, size: 10, font: fontBold, color: WHITE })
  page.drawText('Work Description', { x: tableX + 60, y: y - 16, size: 10, font: fontBold, color: WHITE })
  y -= 22

  workItems.forEach((item, idx) => {
    const lines = wrapText(item, font, 10, tableWidth - 80)
    const rowHeight = Math.max(20, lines.length * 13 + 8)
    if (idx % 2 === 1) {
      page.drawRectangle({ x: tableX, y: y - rowHeight, width: tableWidth, height: rowHeight, color: LIGHT_GRAY })
    }
    page.drawText(String(idx + 1), { x: tableX + 8, y: y - 15, size: 10, font, color: BLACK })
    lines.forEach((line, li) => {
      page.drawText(line, { x: tableX + 60, y: y - 15 - (li * 13), size: 10, font, color: BLACK })
    })
    y -= rowHeight
  })

  page.drawLine({ start: { x: tableX, y }, end: { x: tableX + tableWidth, y }, thickness: 1, color: NAVY })
  y -= 20

  const totalsX = width - 220
  const drawTotalRow = (label, value, bold = false) => {
    const f = bold ? fontBold : font
    page.drawText(label, { x: totalsX, y, size: 10, font: f, color: bold ? NAVY : GRAY })
    const valText = `Rs. ${value.toFixed(2)}`
    page.drawText(valText, { x: width - 40 - f.widthOfTextAtSize(valText, 10), y, size: 10, font: f, color: bold ? NAVY : BLACK })
    y -= 16
  }
  drawTotalRow('Subtotal', subtotal)
  drawTotalRow('CGST @ 9%', cgst)
  drawTotalRow('SGST @ 9%', sgst)
  y -= 4
  page.drawLine({ start: { x: totalsX, y: y + 10 }, end: { x: width - 40, y: y + 10 }, thickness: 1, color: NAVY })
  drawTotalRow('Grand Total', grandTotal, true)

  y -= 25
  page.drawText('Terms & Conditions', { x: 40, y, size: 11, font: fontBold, color: NAVY })
  y -= 16
  const termsLines = terms.split('\n').flatMap(line => wrapText(line, font, 9, width - 80))
  termsLines.forEach(line => {
    page.drawText(line, { x: 40, y, size: 9, font, color: GRAY })
    y -= 12
  })

  drawFooter(page, font, width)
  return await pdfDoc.save()
}