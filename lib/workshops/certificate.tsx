import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'
import { OFFERING_METADATA } from './offerings'

// ── Brand tokens ─────────────────────────────────────────────────────────────
const NAVY  = '#0D3B6E'
const AMBER = '#E67E22'
const MID   = '#555555'
const LIGHT = '#888888'

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    flexDirection: 'column',
  },

  // Navy header band
  header: {
    backgroundColor: NAVY,
    alignItems: 'center',
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 48,
  },
  logo: {
    width: 200,
    height: 68,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Amber stripe
  amberStripe: {
    height: 5,
    backgroundColor: AMBER,
  },

  // White body
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 60,
  },
  certifiesText: {
    fontSize: 11,
    color: LIGHT,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  participantName: {
    fontSize: 38,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 10,
  },
  completedText: {
    fontSize: 11,
    color: LIGHT,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  workshopName: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Detail rows
  detailsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 14,
  },
  detailItem: {
    alignItems: 'center',
    minWidth: 100,
  },
  detailLabel: {
    fontSize: 8,
    color: LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },

  // CADA box
  cadaBox: {
    marginTop: 10,
    backgroundColor: '#F4F7F9',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cadaCppLabel: {
    fontSize: 8,
    color: LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cadaCppNumbers: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  cadaMembershipText: {
    fontSize: 10,
    color: MID,
    marginTop: 5,
  },

  // Navy footer
  footer: {
    backgroundColor: NAVY,
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})

// ── Document component ────────────────────────────────────────────────────────

interface CertProps {
  firstName: string
  lastName: string
  workshop: string
  formattedDate: string
  hours: number
  delivery: string
  cadaCppNumbers?: string[]
  cadaNumber?: string
  logoDataUrl: string
}

function WorkshopCertDocument({
  firstName,
  lastName,
  workshop,
  formattedDate,
  hours,
  delivery,
  cadaCppNumbers,
  cadaNumber,
  logoDataUrl,
}: CertProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Navy header band */}
        <View style={styles.header}>
          <Image src={logoDataUrl} style={styles.logo} />
          <Text style={styles.headerTitle}>Certificate of Attendance</Text>
        </View>

        {/* Amber stripe */}
        <View style={styles.amberStripe} />

        {/* White body */}
        <View style={styles.body}>
          <Text style={styles.certifiesText}>This certifies that</Text>
          <Text style={styles.participantName}>{firstName} {lastName}</Text>
          <Text style={styles.completedText}>has successfully completed</Text>
          <Text style={styles.workshopName}>{workshop}</Text>

          {/* Detail pills */}
          <View style={styles.detailsBlock}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Offered By</Text>
              <Text style={styles.detailValue}>Western Dental Academy</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{hours} {hours === 1 ? 'hour' : 'hours'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Delivery</Text>
              <Text style={styles.detailValue}>{delivery}</Text>
            </View>
          </View>

          {/* CADA section */}
          {(cadaCppNumbers || cadaNumber) && (
            <View style={styles.cadaBox}>
              {cadaCppNumbers && (
                <>
                  <Text style={styles.cadaCppLabel}>CADA Competency Profile Numbers</Text>
                  <Text style={styles.cadaCppNumbers}>{cadaCppNumbers.join(', ')}</Text>
                </>
              )}
              {cadaNumber && (
                <Text style={styles.cadaMembershipText}>CADA Membership #: {cadaNumber}</Text>
              )}
            </View>
          )}
        </View>

        {/* Navy footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>westerndentalacademy.com</Text>
        </View>

      </Page>
    </Document>
  )
}

// ── Generator ─────────────────────────────────────────────────────────────────

export async function generateWorkshopCertificate(params: {
  firstName: string
  lastName: string
  workshop: string
  workshopDate: string
  cadaNumber?: string
}): Promise<Buffer> {
  const { firstName, lastName, workshop, workshopDate, cadaNumber } = params

  const meta = OFFERING_METADATA[workshop]
  const hours    = meta?.hours    ?? 1
  const delivery = meta?.delivery ?? 'In Person'
  const cadaCppNumbers = meta?.cadaCppNumbers

  const formattedDate = new Date(workshopDate).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const logoBuffer = fs.readFileSync(
    path.join(process.cwd(), 'public', 'Western Dental Academy Logo Alternate-1.png')
  )
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`

  const doc = (
    <WorkshopCertDocument
      firstName={firstName}
      lastName={lastName}
      workshop={workshop}
      formattedDate={formattedDate}
      hours={hours}
      delivery={delivery}
      cadaCppNumbers={cadaCppNumbers}
      cadaNumber={cadaNumber}
      logoDataUrl={logoDataUrl}
    />
  )

  const asPdf   = pdf(doc)
  const blob    = await asPdf.toBlob()
  const buffer  = await blob.arrayBuffer()
  return Buffer.from(buffer)
}
