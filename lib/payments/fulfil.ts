// Runs the right fulfilment for a paid checkout, based on its flow.
// Called by the Clover webhook (Stripe flows keep their existing handling).
import { paymentsClient, runFulfilmentOnce, type CheckoutSession } from './checkout'
import { fulfilWorkshopCheckoutFromSession } from '@/lib/workshops/fulfil'
import { fulfilCourseCheckout } from '@/lib/courses/fulfil'
import { fulfilCourseExtension } from '@/lib/courses/extendFulfil'
import { fulfilGiftCertificate } from '@/lib/giftCertificateFulfil'
import { confirmInvigilationBooking } from '@/lib/invigilation/confirm'
import { confirmTutoringPayment } from '@/lib/tutoring/server'

async function fulfilTuition(session: CheckoutSession) {
  const studentId = session.metadata.sanityStudentId
  if (!studentId || !session.paid) return
  await paymentsClient.patch(studentId).set({
    paymentStatus: 'paid',
    ...(session.provider === 'clover'
      ? { paymentProvider: 'clover', cloverPaymentId: session.paymentRef }
      : { stripePaymentIntentId: session.paymentRef }),
  }).commit()
}

export async function fulfilCheckout(session: CheckoutSession): Promise<void> {
  if (!session.paid) return
  await runFulfilmentOnce(session, async () => {
    switch (session.flow) {
      case 'workshops':
      case 'workshop-legacy':
        await fulfilWorkshopCheckoutFromSession(session)
        break
      case 'course':
        await fulfilCourseCheckout(session)
        break
      case 'course-extension':
        await fulfilCourseExtension(session)
        break
      case 'gift-certificate':
        await fulfilGiftCertificate(session)
        break
      case 'invigilation':
        if (session.metadata.invigilationBookingId) {
          await confirmInvigilationBooking(session.id, session.metadata.invigilationBookingId)
        }
        break
      case 'tuition':
        await fulfilTuition(session)
        break
      case 'tutoring':
        if (session.metadata.tutoringInquiryId) {
          await confirmTutoringPayment(session.id, session.metadata.tutoringInquiryId)
        }
        break
      default:
        throw new Error(`Unknown checkout flow: ${session.flow}`)
    }
  })
}
