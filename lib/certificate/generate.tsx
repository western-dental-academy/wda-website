import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

// ── Brand tokens ────────────────────────────────────────────────────────────
const NAVY  = '#0D3B6E'
const BLUE  = '#378ADD'
const AMBER = '#E67E22'
const MID   = '#666666'
const LIGHT = '#888888'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 48,
    fontFamily: 'Helvetica',
  },
  border: {
    border: `3px solid ${NAVY}`,
    padding: 36,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logo: {
    width: 220,
    height: 75,
    marginBottom: 12,
  },

  // ── Thin amber rule under logo ────────────────────────────────────────────
  topRule: {
    width: 100,
    height: 2,
    backgroundColor: AMBER,
    marginBottom: 14,
  },

  // ── "This certifies that" ─────────────────────────────────────────────────
  certifies: {
    fontSize: 12,
    color: MID,
    marginBottom: 10,
  },

  // ── Amber accent lines framing the student name ───────────────────────────
  nameAccent: {
    width: 160,
    height: 3,
    backgroundColor: AMBER,
  },

  // ── Student name ──────────────────────────────────────────────────────────
  studentName: {
    fontSize: 44,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  // ── "has successfully completed" ─────────────────────────────────────────
  completed: {
    fontSize: 12,
    color: MID,
    marginTop: 18,
    marginBottom: 8,
  },

  // ── Programme name ────────────────────────────────────────────────────────
  programName: {
    fontSize: 20,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },

  // ── Issue date ────────────────────────────────────────────────────────────
  date: {
    fontSize: 10,
    color: LIGHT,
  },

  // ── Pushes footer to bottom of flex container ─────────────────────────────
  spacer: {
    flex: 1,
  },

  // ── Footer text (centred at bottom) ──────────────────────────────────────
  footer: {
    fontSize: 9,
    color: BLUE,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  // ── Verification block — absolute, bottom-right ───────────────────────────
  verificationBlock: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationText: {
    flexDirection: 'column',
    gap: 3,
    alignItems: 'flex-end',
  },
  certificateIdLabel: {
    fontSize: 7,
    color: LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  certificateId: {
    fontSize: 9,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
  },
  verifyUrl: {
    fontSize: 7,
    color: BLUE,
  },
  qrCode: {
    width: 44,
    height: 44,
  },
})

// ── Types ────────────────────────────────────────────────────────────────────

interface CertificateProps {
  studentName: string
  programName: string
  completionDate: string
  certificateId: string
  verificationUrl: string
  qrCodeDataUrl: string
  logoDataUrl: string
}

// ── Document component ───────────────────────────────────────────────────────

function CertificateDocument({
  studentName,
  programName,
  completionDate,
  certificateId,
  verificationUrl,
  qrCodeDataUrl,
  logoDataUrl,
}: CertificateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>

          {/* Top spacer — balances the bottom spacer to centre content */}
          <View style={styles.spacer} />

          {/* Logo */}
          <Image src={logoDataUrl} style={styles.logo} />

          {/* Thin amber rule */}
          <View style={styles.topRule} />

          {/* Certifies */}
          <Text style={styles.certifies}>This certifies that</Text>

          {/* Amber line above name */}
          <View style={styles.nameAccent} />

          {/* Student name */}
          <Text style={styles.studentName}>{studentName}</Text>

          {/* Amber line below name */}
          <View style={styles.nameAccent} />

          {/* Completed */}
          <Text style={styles.completed}>has successfully completed</Text>

          {/* Programme name */}
          <Text style={styles.programName}>{programName}</Text>

          {/* Issue date */}
          <Text style={styles.date}>Issued {completionDate}</Text>

          {/* Push footer down */}
          <View style={styles.spacer} />

          {/* Footer */}
          <Text style={styles.footer}>westerndentalacademy.com</Text>

          {/* Verification block — bottom-right, subtle */}
          <View style={styles.verificationBlock}>
            <View style={styles.verificationText}>
              <Text style={styles.certificateIdLabel}>Certificate ID</Text>
              <Text style={styles.certificateId}>{certificateId}</Text>
              <Text style={styles.verifyUrl}>{verificationUrl}</Text>
            </View>
            <Image src={qrCodeDataUrl} style={styles.qrCode} />
          </View>

        </View>
      </Page>
    </Document>
  )
}

// ── Generator ────────────────────────────────────────────────────────────────

export async function generateCertificate(
  studentName: string,
  programName: string,
  completionDate: string,
  certificateId: string,
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
    <CertificateDocument
      studentName={studentName}
      programName={programName}
      completionDate={completionDate}
      certificateId={certificateId}
      verificationUrl={verificationUrl}
      qrCodeDataUrl={qrCodeDataUrl}
      logoDataUrl={logoDataUrl}
    />
  )

  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
