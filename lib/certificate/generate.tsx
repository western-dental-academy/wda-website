import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 60,
    fontFamily: 'Helvetica',
  },
  border: {
    border: '3px solid #0D3B6E',
    padding: 40,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentLine: {
    width: 60,
    height: 3,
    backgroundColor: '#E67E22',
    marginBottom: 24,
  },
  institution: {
    fontSize: 11,
    color: '#378ADD',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  certifies: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 36,
    color: '#0D3B6E',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  completed: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  programName: {
    fontSize: 20,
    color: '#0D3B6E',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  accentLineBottom: {
    width: 60,
    height: 3,
    backgroundColor: '#E67E22',
    marginBottom: 24,
  },
  date: {
    fontSize: 11,
    color: '#888888',
    marginBottom: 40,
  },
  footer: {
    fontSize: 10,
    color: '#378ADD',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})

interface CertificateProps {
  studentName: string
  programName: string
  completionDate: string
}

function CertificateDocument({ studentName, programName, completionDate }: CertificateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.accentLine} />
          <Text style={styles.institution}>Western Dental Academy</Text>
          <Text style={styles.certifies}>This certifies that</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.completed}>has successfully completed</Text>
          <Text style={styles.programName}>{programName}</Text>
          <View style={styles.accentLineBottom} />
          <Text style={styles.date}>Issued {completionDate}</Text>
          <Text style={styles.footer}>westerndentalacademy.com</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateCertificate(
  studentName: string,
  programName: string,
  completionDate: string
): Promise<Buffer> {
  const doc = <CertificateDocument
    studentName={studentName}
    programName={programName}
    completionDate={completionDate}
  />
  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}