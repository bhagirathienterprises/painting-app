import { createPdfWithHeader, drawFooter, wrapText, NAVY, GRAY, BLACK } from './pdfShared'

export async function generateWorkOrderPdf({ workOrderNo, projectTitle, teamName, equipment, instructions, date }) {
  const { pdfDoc, page, font, fontBold, width, y: startY } = await createPdfWithHeader('WORK ORDER', workOrderNo)
  let y = startY

  page.drawText(`Project: ${projectTitle}`, { x: 40, y, size: 11, font: fontBold, color: NAVY })
  y -= 16
  page.drawText(`Date: ${date}`, { x: 40, y, size: 10, font, color: GRAY })
  y -= 16
  page.drawText(`Team Assigned: ${teamName || '-'}`, { x: 40, y, size: 10, font, color: BLACK })
  y -= 16
  page.drawText(`Equipment: ${equipment || '-'}`, { x: 40, y, size: 10, font, color: BLACK })
  y -= 24

  page.drawText('Instructions:', { x: 40, y, size: 11, font: fontBold, color: NAVY })
  y -= 16
  const lines = String(instructions || '').split('\n').flatMap(line => wrapText(line, font, 10, width - 80))
  lines.forEach(line => { page.drawText(line, { x: 40, y, size: 10, font, color: BLACK }); y -= 14 })

  drawFooter(page, font, width)
  return await pdfDoc.save()
}