import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

// ── Brand tokens ────────────────────────────────────────────────────────────
const NAVY       = '#0D3B6E'
const LIGHT_BLUE = '#4BA3E3'
const AMBER      = '#E67E22'
const WHITE      = '#FFFFFF'

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    flexDirection: 'column',
  },

  // Top navy section
  topSection: {
    backgroundColor: NAVY,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  logo: {
    width: 120,
    marginBottom: 6,
  },
  studentName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textAlign: 'center',
    marginBottom: 3,
  },
  programName: {
    fontSize: 7,
    color: LIGHT_BLUE,
    textAlign: 'center',
  },

  // Amber divider stripe
  amberStripe: {
    backgroundColor: AMBER,
    height: 3,
  },

  // Bottom white section
  bottomSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bottomLeft: {
    flex: 1,
    flexDirection: 'column',
  },
  idLabel: {
    fontSize: 5.5,
    color: NAVY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  idNumber: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 3,
  },
  enrollDate: {
    fontSize: 6,
    color: '#888888',
  },
  qrCode: {
    width: 44,
    height: 44,
  },
})

// ── Types ────────────────────────────────────────────────────────────────────

interface IdCardProps {
  studentName: string
  programName: string
  studentId: number
  enrollmentDate: string
  qrCodeDataUrl: string
  logoDataUrl: string
}

// ── Document component ───────────────────────────────────────────────────────

function IdCardDocument({
  studentName,
  programName,
  studentId,
  enrollmentDate,
  qrCodeDataUrl,
  logoDataUrl,
}: IdCardProps) {
  return (
    <Document>
      {/* CR80 card size: 85.6mm × 53.98mm = 242.65pt × 153.01pt */}
      <Page size={[242.65, 153.01]} style={styles.page}>

        {/* Top navy section */}
        <View style={styles.topSection}>
          <Image src={logoDataUrl} style={styles.logo} />
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.programName}>{programName}</Text>
        </View>

        {/* Amber divider */}
        <View style={styles.amberStripe} />

        {/* Bottom white section */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomLeft}>
            <Text style={styles.idLabel}>Student ID</Text>
            <Text style={styles.idNumber}>{studentId + 99999}</Text>
            <Text style={styles.enrollDate}>Enrolled {enrollmentDate}</Text>
          </View>
          <Image src={qrCodeDataUrl} style={styles.qrCode} />
        </View>

      </Page>
    </Document>
  )
}

// ── Generator ────────────────────────────────────────────────────────────────

export async function generateStudentIdCard(
  studentName: string,
  programName: string,
  studentId: number,
  enrollmentDate: string,
  verificationUrl: string
): Promise<Buffer> {
  const [qrCodeDataUrl, logoBuffer] = await Promise.all([
    QRCode.toDataURL(verificationUrl, {
      width: 128,
      margin: 1,
      color: { dark: NAVY, light: '#ffffff' },
    }),
    Promise.resolve(
      fs.readFileSync(
        path.join(process.cwd(), 'public', 'Western Dental Academy Logo Alternate-1.png')
      )
    ),
  ])

  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`

  const doc = (
    <IdCardDocument
      studentName={studentName}
      programName={programName}
      studentId={studentId}
      enrollmentDate={enrollmentDate}
      qrCodeDataUrl={qrCodeDataUrl}
      logoDataUrl={logoDataUrl}
    />
  )

  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
