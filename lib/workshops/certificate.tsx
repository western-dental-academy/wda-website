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

  // Navy header band — kept compact to leave maximum body space
  header: {
    backgroundColor: NAVY,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 48,
  },
  logo: {
    width: 160,
    height: 54,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Amber stripe
  amberStripe: {
    height: 4,
    backgroundColor: AMBER,
  },

  // White body — wrap={false} prevents page breaks inside
  // paddingBottom must clear the absolutely-positioned footer (~29pt)
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 52,
  },
  certifiesText: {
    fontSize: 10,
    color: LIGHT,
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  participantName: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 6,
  },
  completedText: {
    fontSize: 10,
    color: LIGHT,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  workshopName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Detail pills row
  detailsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 10,
  },
  detailItem: {
    alignItems: 'center',
    minWidth: 90,
  },
  detailLabel: {
    fontSize: 7,
    color: LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },

  // CADA box
  cadaBox: {
    marginTop: 7,
    backgroundColor: '#F4F7F9',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  cadaCppLabel: {
    fontSize: 8,
    color: LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  cadaCppNumbers: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  cadaMembershipText: {
    fontSize: 9,
    color: MID,
    marginTop: 3,
  },

  // Learning objectives — used when shown solo (no breakdown alongside)
  objectivesSection: { marginTop: 6, marginBottom: 3, alignSelf: 'stretch' },
  objectivesTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  objectiveRow: { flexDirection: 'row' as const, marginBottom: 1, paddingLeft: 2 },
  objectiveBullet: { fontSize: 6, color: AMBER, marginRight: 3, marginTop: 1 },
  objectiveText: { fontSize: 6, color: '#374151', flex: 1, lineHeight: 1.4 },

  // Speaker hours breakdown — used when shown solo (no objectives alongside)
  breakdownSection: { marginTop: 6, marginBottom: 4, alignSelf: 'stretch' },
  breakdownTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 },
  breakdownTable: { borderWidth: 0.5, borderColor: '#e5e7eb', borderRadius: 3 },
  breakdownHeaderRow: { flexDirection: 'row', backgroundColor: NAVY, borderRadius: 3 },
  breakdownHeader: { color: '#ffffff', fontFamily: 'Helvetica-Bold' },
  breakdownRow: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#e5e7eb' },
  breakdownRowEven: { backgroundColor: '#f9fafb' },
  breakdownCell: { fontSize: 6, padding: 2, color: '#374151' },
  breakdownTotalRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: NAVY, backgroundColor: '#f0f4f8' },
  breakdownTotal: { fontFamily: 'Helvetica-Bold', color: NAVY },

  // Navy footer — absolutely positioned so it never pushes content down
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

// ── Reusable sub-components ───────────────────────────────────────────────────

function ObjectivesList({ objectives }: { objectives: string[] }) {
  return (
    <>
      <Text style={styles.objectivesTitle}>Learning Objectives</Text>
      {objectives.map((obj, i) => (
        <View key={i} style={styles.objectiveRow}>
          <Text style={styles.objectiveBullet}>•</Text>
          <Text style={styles.objectiveText}>{obj}</Text>
        </View>
      ))}
    </>
  )
}

function BreakdownTable({ breakdown, hours }: { breakdown: SpeakerBreakdownEntry[]; hours: number }) {
  return (
    <>
      <Text style={styles.breakdownTitle}>Hours Breakdown</Text>
      <View style={styles.breakdownTable}>
        <View style={styles.breakdownHeaderRow}>
          <Text style={[styles.breakdownCell, styles.breakdownHeader, { flex: 2 }]}>Speaker</Text>
          <Text style={[styles.breakdownCell, styles.breakdownHeader, { flex: 3 }]}>Topic</Text>
          <Text style={[styles.breakdownCell, styles.breakdownHeader, { flex: 1, textAlign: 'right' }]}>Hours</Text>
        </View>
        {breakdown.map((row, i) => (
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
    </>
  )
}

// ── Document component ────────────────────────────────────────────────────────

interface CertProps {
  firstName: string
  lastName: string
  workshop: string
  formattedDate: string
  hours: number
  delivery: string
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
  cadaNumber,
  logoDataUrl,
  speakerBreakdown,
  learningObjectives,
}: CertProps) {
  const hasObjectives = learningObjectives && learningObjectives.length > 0
  const hasBreakdown  = speakerBreakdown  && speakerBreakdown.length  > 0
  // When both are present, render side-by-side to save vertical space
  const showTwoColumn = hasObjectives && hasBreakdown

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

        {/* White body — wrap={false} prevents @react-pdf from splitting onto page 2 */}
        <View style={styles.body} wrap={false}>
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

          {/* CADA membership number */}
          {cadaNumber && (
            <View style={styles.cadaBox}>
              <Text style={styles.cadaMembershipText}>CADA Membership #: {cadaNumber}</Text>
            </View>
          )}

          {/* Two-column layout when both objectives and breakdown are present */}
          {showTwoColumn && (
            <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <ObjectivesList objectives={learningObjectives!} />
              </View>
              <View style={{ flex: 1 }}>
                <BreakdownTable breakdown={speakerBreakdown!} hours={hours} />
              </View>
            </View>
          )}

          {/* Solo learning objectives (no breakdown) */}
          {hasObjectives && !showTwoColumn && (
            <View style={styles.objectivesSection}>
              <ObjectivesList objectives={learningObjectives!} />
            </View>
          )}

          {/* Solo speaker breakdown (no objectives) */}
          {hasBreakdown && !showTwoColumn && (
            <View style={styles.breakdownSection}>
              <BreakdownTable breakdown={speakerBreakdown!} hours={hours} />
            </View>
          )}
        </View>

        {/* Navy footer — absolutely positioned, never in flow */}
        <View style={styles.footer} fixed>
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
