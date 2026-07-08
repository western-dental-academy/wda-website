import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2px solid #0D3B6E',
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  transcriptTitle: {
    fontSize: 20,
    color: '#0D3B6E',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  transcriptSubtitle: {
    fontSize: 10,
    color: '#888888',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    color: '#378ADD',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '45%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: '#0D3B6E',
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0D3B6E',
    padding: '6 10',
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '8 10',
    borderBottom: '1px solid #f0f0f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: '8 10',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#F4F7F9',
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
  },
  tableCellBold: {
    fontSize: 10,
    color: '#0D3B6E',
    fontFamily: 'Helvetica-Bold',
  },
  completeBadge: {
    fontSize: 8,
    color: '#16a34a',
    fontFamily: 'Helvetica-Bold',
  },
  incompleteBadge: {
    fontSize: 8,
    color: '#888888',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#aaaaaa',
  },
  amberLine: {
    height: 3,
    backgroundColor: '#E67E22',
    marginBottom: 24,
    width: 40,
  },
})

interface TranscriptProps {
  student: {
    firstName: string
    lastName: string
    email: string
    program: string
    enrollmentDate: string
    cohort?: string
  }
  grades: any[]
  activityNames: Record<number, string>
  progress: any[]
  generatedDate: string
}

function TranscriptDocument({ student, grades, activityNames, progress, generatedDate }: TranscriptProps) {
  const completedCount = progress.filter((s: any) => s.state === 1).length
  const totalCount = progress.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Image src={`${process.env.NEXT_PUBLIC_SITE_URL}/Western Dental Academy Logo Alternate-1.png`} style={styles.logo} />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.transcriptTitle}>Academic Transcript</Text>
            <Text style={styles.transcriptSubtitle}>Official Record — Western Dental Academy</Text>
          </View>
        </View>

        {/* Amber accent */}
        <View style={styles.amberLine} />

        {/* Student info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{student.firstName} {student.lastName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{student.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Programme</Text>
              <Text style={styles.infoValue}>{student.program}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Enrolment Date</Text>
              <Text style={styles.infoValue}>{student.enrollmentDate}</Text>
            </View>
            {student.cohort && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cohort</Text>
                <Text style={styles.infoValue}>{student.cohort}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Overall Progress</Text>
              <Text style={styles.infoValue}>{progressPct}% ({completedCount}/{totalCount} modules)</Text>
            </View>
          </View>
        </View>

        {/* Grades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grade Record</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Assessment</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Grade</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Percentage</Text>
            </View>
            {grades.length > 0 ? grades.map((item: any, i: number) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{item.itemname ?? 'Course Total'}</Text>
                <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'center' }]}>{item.gradeformatted ?? '—'}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.percentageformatted ?? '—'}</Text>
              </View>
            )) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>No grades recorded yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* Module completion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Module Completion</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Module</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Status</Text>
            </View>
            {progress.map((item: any, i: number) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{activityNames[item.cmid] ?? item.modname}</Text>
                <Text style={[item.state === 1 ? styles.completeBadge : styles.incompleteBadge, { flex: 1, textAlign: 'center' }]}>
                  {item.state === 1 ? 'Complete' : 'Incomplete'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Western Dental Academy — westerndentalacademy.com</Text>
          <Text style={styles.footerText}>Generated {generatedDate}</Text>
        </View>

      </Page>
    </Document>
  )
}

export async function generateTranscript(
  student: TranscriptProps['student'],
  grades: any[],
  activityNames: Record<number, string>,
  progress: any[],
): Promise<Buffer> {
  const generatedDate = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const doc = (
    <TranscriptDocument
      student={student}
      grades={grades}
      activityNames={activityNames}
      progress={progress}
      generatedDate={generatedDate}
    />
  )
  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}