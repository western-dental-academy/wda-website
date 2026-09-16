import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'
import { OFFERING_METADATA, type SpeakerBreakdownEntry } from './offerings'

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

  // White body — paddingBottom accounts for the absolutely-positioned footer (~29pt)
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 36,
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

  // Learning objectives
  objectivesSection: { marginTop: 8, marginBottom: 4, alignSelf: 'stretch' },
  objectivesTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0D3B6E',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  objectiveRow: { flexDirection: 'row' as const, marginBottom: 2, paddingLeft: 4 },
  objectiveBullet: { fontSize: 6.5, color: '#E67E22', marginRight: 4, marginTop: 1 },
  objectiveText: { fontSize: 6.5, color: '#374151', flex: 1, lineHeight: 1.4 },

  // Speaker hours breakdown
  breakdownSection: { marginTop: 8, marginBottom: 8, alignSelf: 'stretch' },
  breakdownTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0D3B6E', marginBottom: 6 },
  breakdownTable: { borderWidth: 0.5, borderColor: '#e5e7eb', borderRadius: 3 },
  breakdownHeaderRow: { flexDirection: 'row', backgroundColor: '#0D3B6E', borderRadius: 3 },
  breakdownHeader: { color: '#ffffff', fontFamily: 'Helvetica-Bold' },
  breakdownRow: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#e5e7eb' },
  breakdownRowEven: { backgroundColor: '#f9fafb' },
  breakdownCell: { fontSize: 6.5, padding: 3, color: '#374151' },
  breakdownTotalRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#0D3B6E', backgroundColor: '#f0f4f8' },
  breakdownTotal: { fontFamily: 'Helvetica-Bold', color: '#0D3B6E' },

  // Navy footer — position absolute keeps it pinned to bottom, out of the flow
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  speakerBreakdown?: SpeakerBreakdownEntry[] | null
  learningObjectives?: string[] | null
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
  speakerBreakdown,
  learningObjectives,
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

          {/* Learning objectives */}
          {learningObjectives && learningObjectives.length > 0 && (
            <View style={styles.objectivesSection}>
              <Text style={styles.objectivesTitle}>Learning Objectives</Text>
              {learningObjectives.map((obj, i) => (
                <View key={i} style={styles.objectiveRow}>
                  <Text style={styles.objectiveBullet}>•</Text>
                  <Text style={styles.objectiveText}>{obj}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Speaker hours breakdown */}
          {speakerBreakdown && speakerBreakdown.length > 0 && (
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Hours Breakdown</Text>
              <View style={styles.breakdownTable}>
                <View style={styles.breakdownHeaderRow}>
                  <Text style={[styles.breakdownCell, styles.breakdownHeader, { flex: 2 }]}>Speaker</Text>
                  <Text style={[styles.breakdownCell, styles.breakdownHeader, { flex: 3 }]}>Topic</Text>
                  <Text style={[styles.breakdownCell, styles.breakdownHeader, { flex: 1, textAlign: 'right' }]}>Hours</Text>
                </View>
                {speakerBreakdown.map((row, i) => (
                  <View key={i} style={[styles.breakdownRow, i % 2 === 0 ? styles.breakdownRowEven : {}]}>
                    <Text style={[styles.breakdownCell, { flex: 2 }]}>{row.speaker}</Text>
                    <Text style={[styles.breakdownCell, { flex: 3 }]}>{row.topic}</Text>
                    <Text style={[styles.breakdownCell, { flex: 1, textAlign: 'right' }]}>{row.hours} hrs</Text>
                  </View>
                ))}
                <View style={styles.breakdownTotalRow}>
                  <Text style={[styles.breakdownCell, styles.breakdownTotal, { flex: 5 }]}>Total</Text>
                  <Text style={[styles.breakdownCell, styles.breakdownTotal, { flex: 1, textAlign: 'right' }]}>{hours} hrs</Text>
                </View>
              </View>
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
  const hours              = meta?.hours              ?? 1
  const delivery           = meta?.delivery           ?? 'In Person'
  const cadaCppNumbers     = meta?.cadaCppNumbers
  const speakerBreakdown   = meta?.speakerBreakdown   ?? null
  const learningObjectives = meta?.learningObjectives ?? null

  const formattedDate = new Date(workshopDate).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const logoBuffer = fs.readFileSync(
    path.join(process.cwd(), 'public', 'Inverted.png')
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
      speakerBreakdown={speakerBreakdown}
      learningObjectives={learningObjectives}
    />
  )

  const asPdf   = pdf(doc)
  const blob    = await asPdf.toBlob()
  const buffer  = await blob.arrayBuffer()
  return Buffer.from(buffer)
}
