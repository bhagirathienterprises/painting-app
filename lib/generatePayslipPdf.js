import { createPdfWithHeader, drawFooter, NAVY, GRAY, LIGHT_GRAY, WHITE, BLACK } from './pdfShared'

export async function generatePayslipPdf({ payslipNo, projectTitle, teamName, memberAmounts, amountPaid, totalPayable, remaining, date }) {
  const { pdfDoc, page, font, fontBold, width, y: startY } = await createPdfWithHeader('LABOUR PAYSLIP', payslipNo)
  let y = startY

  page.drawText(`Project: ${projectTitle}`, { x: 40, y, size: 11, font: fontBold, color: NAVY })
  y -= 16
  page.drawText(`Team: ${teamName}`, { x: 40, y, size: 10, font, color: GRAY })
  const dateText = `Date: ${date}`
  page.drawText(dateText, { x: width - 40 - font.widthOfTextAtSize(dateText, 10), y: y + 16, size: 10, font, color: GRAY })
  y -= 30

  const tableX = 40
  const tableWidth = width - 80
  page.drawRectangle({ x: tableX, y: y - 22, width: tableWidth, height: 22, color: NAVY })
  page.drawText('Labour Name', { x: tableX + 8, y: y - 16, size: 10, font: fontBold, color: WHITE })
  page.drawText('Amount Paid', { x: width - 140, y: y - 16, size: 10, font: fontBold, color: WHITE })
  y -= 22

  memberAmounts.forEach((m, idx) => {
    const rowHeight = 22
    if (idx % 2 === 1) page.drawRectangle({ x: tableX, y: y - rowHeight, width: tableWidth, height: rowHeight, color: LIGHT_GRAY })
    page.drawText(m.name, { x: tableX + 8, y: y - 15, size: 10, font, color: BLACK })
    const amtText = `Rs. ${m.amount.toFixed(2)}`
    page.drawText(amtText, { x: width - 140, y: y - 15, size: 10, font, color: BLACK })
    y -= rowHeight
  })

  page.drawLine({ start: { x: tableX, y }, end: { x: tableX + tableWidth, y }, thickness: 1, color: NAVY })
  y -= 22

  page.drawText('Total Paid Now:', { x: tableX, y, size: 11, font: fontBold, color: NAVY })
  const paidText = `Rs. ${amountPaid.toFixed(2)}`
  page.drawText(paidText, { x: width - 40 - fontBold.widthOfTextAtSize(paidText, 11), y, size: 11, font: fontBold, color: NAVY })
  y -= 18

  page.drawText('Total Payable (this team):', { x: tableX, y, size: 9, font, color: GRAY })
  const payableText = `Rs. ${totalPayable.toFixed(2)}`
  page.drawText(payableText, { x: width - 40 - font.widthOfTextAtSize(payableText, 9), y, size: 9, font, color: GRAY })
  y -= 16

  if (remaining > 0.01) {
    page.drawText('Remaining Payable:', { x: tableX, y, size: 11, font: fontBold, color: NAVY })
    const remText = `Rs. ${remaining.toFixed(2)}`
    page.drawText(remText, { x: width - 40 - fontBold.widthOfTextAtSize(remText, 11), y, size: 11, font: fontBold, color: NAVY })
  } else {
    page.drawText('Status: FULLY PAID', { x: tableX, y, size: 11, font: fontBold, color: NAVY })
  }

  drawFooter(page, font, width)
  return await pdfDoc.save()
}