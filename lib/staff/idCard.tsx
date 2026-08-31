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
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 9,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 3,
  },
  role: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#666666',
    marginBottom: 2,
  },
  department: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    color: '#AAAAAA',
  },
  idSection: {
    flexDirection: 'column',
  },
  idLabel: {
    fontSize: 5.5,
    fontFamily: 'Helvetica',
    color: BLUE,
    marginBottom: 2,
  },
  idNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    marginBottom: 3,
  },
  issuedDate: {
    fontSize: 5.5,
    fontFamily: 'Helvetica',
    color: '#CCCCCC',
  },
})

export interface StaffIdCardProps {
  name: string
  role: string
  department: string
  staffId: string
  logoUrl: string
}

export function StaffIdCardDocument({ name, role, department, staffId, logoUrl }: StaffIdCardProps) {
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
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.role}>{role}</Text>
            <Text style={styles.department}>{department ? department.toUpperCase() : ''}</Text>
          </View>
          <View style={styles.idSection}>
            <Text style={styles.idLabel}>STAFF ID</Text>
            <Text style={styles.idNumber}>{staffId}</Text>
            <Text style={styles.issuedDate}>Issued {issuedDate}</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
