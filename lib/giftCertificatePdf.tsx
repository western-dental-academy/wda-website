import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import { formatExpiryDisplay } from './giftCertificates'

const NAVY  = '#0D3B6E'
const AMBER = '#E67E22'
const BLUE  = '#378ADD'

const styles = StyleSheet.create({
  page: {
    backgroundColor: NAVY,
    flexDirection: 'column',
    width: 500,
    height: 300,
  },
  // Top bar with logo
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 28,
    paddingBottom: 0,
  },
  logo: {
    width: 120,
    height: 40,
  },
  // Main body
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 0,
  },
  // Left column — recipient + message
  left: {
    flex: 1,
    paddingRight: 20,
  },
  giftLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: AMBER,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: AMBER,
    marginBottom: 2,
    lineHeight: 1.1,
  },
  tagline: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: BLUE,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  forLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  recipientName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  message: {
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.5,
    flexShrink: 1,
  },
  // Right column — amount + code
  right: {
    width: 160,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  amount: {
    fontSize: 34,
    fontFamily: 'Helvetica-Bold',
    color: AMBER,
    lineHeight: 1,
  },
  currency: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  codeBox: {
    alignItems: 'flex-end',
  },
  codeLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  codePill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  codeText: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  expiry: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 5,
    textAlign: 'right',
  },
  // Footer
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  website: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  amberLine: {
    height: 3,
    backgroundColor: AMBER,
    marginTop: 2,
  },
})

export interface GiftCertificatePdfProps {
  recipientName: string
  amount: number
  message?: string
  code: string
  expiresAt: string
  logoBase64: string
}

function GiftCertDocument({
  recipientName,
  amount,
  message,
  code,
  expiresAt,
  logoBase64,
}: GiftCertificatePdfProps) {
  return (
    <Document>
      <Page size={[500, 300]} style={styles.page}>
        {/* Amber top line */}
        <View style={styles.amberLine} />

        {/* Header with logo */}
        <View style={styles.header}>
          <Image src={logoBase64} style={styles.logo} />
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Left column */}
          <View style={styles.left}>
            <Text style={styles.giftLabel}>Gift Certificate</Text>
            <Text style={styles.heading}>Give the Gift{'\n'}of Learning</Text>
            <Text style={styles.tagline}>Western Dental Academy Professional Development</Text>
            <Text style={styles.forLabel}>For</Text>
            <Text style={styles.recipientName}>{recipientName}</Text>
            {message ? (
              <Text style={styles.message}>&ldquo;{message}&rdquo;</Text>
            ) : null}
          </View>

          {/* Right column */}
          <View style={styles.right}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Value</Text>
              <Text style={styles.amount}>${amount}</Text>
              <Text style={styles.currency}>CAD</Text>
            </View>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Certificate Code</Text>
              <View style={styles.codePill}>
                <Text style={styles.codeText}>{code}</Text>
              </View>
              <Text style={styles.expiry}>Valid until {formatExpiryDisplay(expiresAt)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.website}>westerndentalacademy.com</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateGiftCertPdf(props: GiftCertificatePdfProps): Promise<Buffer> {
  const blob = await pdf(<GiftCertDocument {...props} />).toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
