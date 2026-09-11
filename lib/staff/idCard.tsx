import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const NAVY  = '#0D3B6E'
const BLUE  = '#378ADD'
const AMBER = '#E67E22'
const WHITE = '#FFFFFF'

const styles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    flexDirection: 'column',
  },
  // ── Header (unchanged) ────────────────────────────────────────────────────────
  header: {
    backgroundColor: NAVY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    height: 52,
  },
  logo: {
    width: 100,
    height: 24,
    objectFit: 'contain',
  },
  staffLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: AMBER,
    letterSpacing: 2,
  },
  // ── Amber bar (unchanged) ─────────────────────────────────────────────────────
  amberBar: {
    backgroundColor: AMBER,
    height: 3,
  },
  // ── Body: flex column ─────────────────────────────────────────────────────────
  // Body inner height = 153 − 52 − 3 − 12 (pad) = 86 pt
  // topRow ~52 pt + bottomRow ~32 pt = 84 pt → fits with 2 pt breathing room
  body: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
  },
  // ── Top row: photo (left) + info (right) ─────────────────────────────────────
  topRow: {
    flex: 1,
    flexDirection: 'row',
  },
  photoColumn: {
    width: 44,
    alignItems: 'center',
    paddingTop: 1,
  },
  photo: {
    width: 40,
    height: 50,
    objectFit: 'cover',
    borderRadius: 2,
  },
  photoPlaceholder: {
    width: 40,
    height: 50,
    borderRadius: 2,
    backgroundColor: NAVY,
  },
  infoColumn: {
    flex: 1,
    paddingLeft: 8,
    flexDirection: 'column',
  },
  name: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 1,
  },
  role: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#666666',
    marginBottom: 1,
  },
  department: {
    fontSize: 6,
    fontFamily: 'Helvetica',
    color: '#AAAAAA',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  idLabel: {
    fontSize: 5.5,
    fontFamily: 'Helvetica',
    color: BLUE,
    marginBottom: 0.5,
  },
  idNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
  // ── Bottom row: issue date (left) + QR (right) ───────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  issuedDate: {
    fontSize: 6,
    fontFamily: 'Helvetica',
    color: '#CCCCCC',
  },
  qrSection: {
    alignItems: 'center',
  },
  qrImage: {
    width: 28,
    height: 28,
  },
  qrLabel: {
    fontSize: 5,
    fontFamily: 'Helvetica',
    color: '#CCCCCC',
    marginTop: 1,
    textAlign: 'center',
  },
})

export interface StaffIdCardProps {
  name: string
  role: string
  department: string
  staffId: string
  logoUrl: string
  photoBase64: string | null
  qrBase64: string
}

export function StaffIdCardDocument({ name, role, department, staffId, logoUrl, photoBase64, qrBase64 }: StaffIdCardProps) {
  const issuedDate = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      {/* CR80 credit card size: 243pt × 153pt — single page */}
      <Page size={[243, 153]} style={styles.page}>

        {/* Full-width navy header */}
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
          <Text style={styles.staffLabel}>STAFF</Text>
        </View>

        {/* Amber accent stripe */}
        <View style={styles.amberBar} />

        {/* Card body */}
        <View style={styles.body}>

          {/* Top row: photo (left) + info (right) */}
          <View style={styles.topRow}>
            <View style={styles.photoColumn}>
              {photoBase64 ? (
                <Image src={photoBase64} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder} />
              )}
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.role}>{role}</Text>
              <Text style={styles.department}>{department ? department.toUpperCase() : ''}</Text>
              <View>
                <Text style={styles.idLabel}>STAFF ID</Text>
                <Text style={styles.idNumber}>{staffId}</Text>
              </View>
            </View>
          </View>

          {/* Bottom row: issue date (left) + QR code (right) */}
          <View style={styles.bottomRow}>
            <Text style={styles.issuedDate}>Issued {issuedDate}</Text>
            <View style={styles.qrSection}>
              <Image src={qrBase64} style={styles.qrImage} />
              <Text style={styles.qrLabel}>westerndentalacademy.com</Text>
            </View>
          </View>

        </View>

      </Page>
    </Document>
  )
}
