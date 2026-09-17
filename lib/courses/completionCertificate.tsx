import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'

const NAVY  = '#0D3B6E'
const AMBER = '#E67E22'
const LIGHT = '#888888'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: NAVY,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 48,
  },
  logo: { width: 160, height: 54, marginBottom: 8 },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  amberStripe: { height: 4, backgroundColor: AMBER },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 44,
    paddingHorizontal: 52,
  },
  certifiesText:  { fontSize: 10, color: LIGHT, marginBottom: 5, letterSpacing: 0.5 },
  participantName: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 6,
  },
  completedText: { fontSize: 10, color: LIGHT, marginBottom: 6, letterSpacing: 0.5 },
  courseName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  detailItem: { alignItems: 'center', minWidth: 90 },
  detailLabel: {
    fontSize: 7,
    color: LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: NAVY },
  badge: {
    borderWidth: 1,
    borderColor: AMBER,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  badgeText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: AMBER, letterSpacing: 0.5 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: NAVY,
    paddingVertical: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})

interface CertProps {
  firstName: string
  lastName: string
  courseName: string
  completedDate: string
  hours: number
  logoDataUrl: string
}

function CompletionCertDocument({ firstName, lastName, courseName, completedDate, hours, logoDataUrl }: CertProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoDataUrl} style={styles.logo} />
          <Text style={styles.headerTitle}>Certificate of Completion</Text>
        </View>

        <View style={styles.amberStripe} />

        <View style={styles.body} wrap={false}>
          <Text style={styles.certifiesText}>This certifies that</Text>
          <Text style={styles.participantName}>{firstName} {lastName}</Text>
          <Text style={styles.completedText}>has successfully completed the online refresher course</Text>
          <Text style={styles.courseName}>{courseName}</Text>

          <View style={styles.detailsBlock}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Offered By</Text>
              <Text style={styles.detailValue}>Western Dental Academy</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Completed</Text>
              <Text style={styles.detailValue}>{completedDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{hours} {hours === 1 ? 'hour' : 'hours'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Delivery</Text>
              <Text style={styles.detailValue}>Online</Text>
            </View>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>ONLINE SELF-PACED REFRESHER COURSE</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>westerndentalacademy.com</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateCompletionCertificate(params: {
  firstName: string
  lastName: string
  courseName: string
  completedAt: string
  hours: number
}): Promise<Buffer> {
  const { firstName, lastName, courseName, completedAt, hours } = params

  const completedDate = new Date(completedAt).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'Inverted.png'))
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`

  const doc = (
    <CompletionCertDocument
      firstName={firstName}
      lastName={lastName}
      courseName={courseName}
      completedDate={completedDate}
      hours={hours}
      logoDataUrl={logoDataUrl}
    />
  )

  const asPdf  = pdf(doc)
  const blob   = await asPdf.toBlob()
  const buffer = await blob.arrayBuffer()
  return Buffer.from(buffer)
}
