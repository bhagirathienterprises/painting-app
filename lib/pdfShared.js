import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { companyInfo } from './companyInfo'

export const NAVY = rgb(27/255, 42/255, 74/255)
export const GRAY = rgb(0.35, 0.35, 0.35)
export const LIGHT_GRAY = rgb(0.95, 0.95, 0.95)
export const WHITE = rgb(1, 1, 1)
export const BLACK = rgb(0, 0, 0)

export function wrapText(text, font, size, maxWidth) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function createPdfWithHeader(docTitle, docNo) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let logoImage = null
  try {
    const logoBytes = await fetch(companyInfo.logo).then(r => r.arrayBuffer())
    logoImage = await pdfDoc.embedPng(logoBytes)
  } catch (e) {
    console.warn('Logo not loaded', e)
  }

  let y = height - 40

  if (logoImage) {
    const logoHeight = 70
    const logoWidth = (logoImage.width / logoImage.height) * logoHeight
    page.drawImage(logoImage, { x: (width - logoWidth) / 2, y: y - logoHeight, width: logoWidth, height: logoHeight })
    y -= logoHeight + 10
  } else {
    page.drawText(companyInfo.name, { x: 40, y, size: 20, font: fontBold, color: NAVY })
    y -= 25
  }

  const contactLine = `${companyInfo.address}  |  Ph: ${companyInfo.phone}  |  GSTIN: ${companyInfo.gstin}`
  page.drawText(contactLine, { x: (width - font.widthOfTextAtSize(contactLine, 9)) / 2, y, size: 9, font, color: GRAY })
  y -= 20

  const barHeight = 30
  page.drawRectangle({ x: 0, y: y - barHeight, width, height: barHeight, color: NAVY })
  page.drawText(docTitle, { x: 40, y: y - barHeight + 9, size: 14, font: fontBold, color: WHITE })
  const noText = `No: ${docNo}`
  page.drawText(noText, { x: width - 40 - fontBold.widthOfTextAtSize(noText, 11), y: y - barHeight + 10, size: 11, font: fontBold, color: WHITE })
  y -= barHeight + 25

  return { pdfDoc, page, font, fontBold, width, height, y }
}

export function drawFooter(page, font, width) {
  page.drawRectangle({ x: 0, y: 0, width, height: 4, color: NAVY })
  const footerText = 'Thank you for your business!'
  page.drawText(footerText, { x: (width - font.widthOfTextAtSize(footerText, 9)) / 2, y: 15, size: 9, font, color: GRAY })
}