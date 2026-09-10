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
  amberBar: {
    backgroundColor: AMBER,
    height: 3,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 9,
  },
  photoColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 1,
  },
  photo: {
    width: 55,
    height: 73,
    objectFit: 'cover',
    borderRadius: 3,
  },
  photoPlaceholder: {
    width: 55,
    height: 73,
    borderRadius: 3,
    backgroundColor: NAVY,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 2,
  },
  role: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#666666',
    marginBottom: 2,
  },
  department: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#AAAAAA',
    letterSpacing: 0.8,
  },
  idSection: {
    flexDirection: 'column',
  },
  idLabel: {
    fontSize: 5.5,
    fontFamily: 'Helvetica',
    color: BLUE,
    marginBottom: 1,
  },
  idNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
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
    width: 40,
    height: 40,
  },
  qrLabel: {
    fontSize: 5,
    fontFamily: 'Helvetica',
    color: '#CCCCCC',
    marginTop: 1,
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
      {/* CR80 credit card size: 243pt × 153pt */}
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

          {/* Left column — photo or placeholder */}
          <View style={styles.photoColumn}>
            {photoBase64 ? (
              <Image src={photoBase64} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder} />
            )}
          </View>

          {/* Right column — info + QR */}
          <View style={styles.contentColumn}>

            {/* Name / role / department */}
            <View style={styles.topSection}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.role}>{role}</Text>
              <Text style={styles.department}>{department ? department.toUpperCase() : ''}</Text>
            </View>

            {/* Staff ID */}
            <View style={styles.idSection}>
              <Text style={styles.idLabel}>STAFF ID</Text>
              <Text style={styles.idNumber}>{staffId}</Text>
            </View>

            {/* Bottom row — issue date + QR */}
            <View style={styles.bottomRow}>
              <Text style={styles.issuedDate}>Issued {issuedDate}</Text>
              <View style={styles.qrSection}>
                <Image src={qrBase64} style={styles.qrImage} />
                <Text style={styles.qrLabel}>westerndentalacademy.com</Text>
              </View>
            </View>

          </View>
        </View>

      </Page>
    </Document>
  )
}
