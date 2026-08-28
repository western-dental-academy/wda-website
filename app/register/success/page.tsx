import type { Metadata } from "next";
import Link from "next/link";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@sanity/client";
import { Resend } from "resend";

export const metadata: Metadata = {
  title: "Registration Confirmed",
  description: "Your workshop registration is confirmed. See you soon at Western Dental Academy.",
};

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; id?: string }>;
}) {
  const { session_id: sessionId, id: registrationId } = await searchParams;

  let firstName = "";
  let email = "";
  let workshop = "";
  let confirmed = false;

  if (sessionId && registrationId) {
    try {
      // Check if already processed (idempotency guard)
      const existing = await sanity.fetch<{
        firstName: string;
        email: string;
        workshop: string;
        workshopDateId: string | null;
        stripePaymentStatus: string;
      } | null>(
        `*[_id == $id][0]{ firstName, email, workshop, workshopDateId, stripePaymentStatus }`,
        { id: registrationId }
      );

      if (existing) {
        firstName = existing.firstName ?? "";
        email = existing.email ?? "";
        workshop = existing.workshop ?? "";

        if (existing.stripePaymentStatus === "paid") {
          // Already processed — just show confirmation
          confirmed = true;
        } else {
          // Verify payment with Stripe
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session.payment_status === "paid") {
            // Mark as paid in Sanity
            await sanity
              .patch(registrationId)
              .set({ stripePaymentStatus: "paid" })
              .commit();
            confirmed = true;

            // Fetch workshop date for email
            let formattedDate = '';
            if (existing.workshopDateId) {
              const dateDoc = await sanity.fetch<{ date: string } | null>(
                `*[_id == $id][0]{ date }`,
                { id: existing.workshopDateId }
              );
              if (dateDoc?.date) {
                formattedDate = new Date(dateDoc.date).toLocaleString('en-CA', {
                  timeZone: 'America/Edmonton',
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                });
              }
            }

            const isErgonomics = workshop.includes('Ergonomics in Dentistry');
                    const isNationalBoard = workshop.includes('National Board');

            // Send confirmation email to registrant
            await resend.emails.send({
              from: "Western Dental Academy <info@westerndentalacademy.com>",
              to: email,
              subject: `Registration Confirmed — ${workshop}`,
              html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                  <div style="background-color:#1E3560;padding:28px 32px;">
                    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Registration Confirmed</h1>
                    <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
                  </div>
                  <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
                    <p style="color:#1E3560;font-size:15px;margin:0 0 16px;">Hi ${firstName},</p>
                    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px;">
                      You're registered! We look forward to seeing you at the event.
                    </p>
                    <p style="color:#1E3560;font-size:16px;font-weight:700;margin:0 0 8px;">${workshop}</p>
                    ${formattedDate ? `<p style="color:#374151;font-size:14px;margin:0 0 20px;">${formattedDate}</p>` : ''}
                    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
                      Our team will be in touch if there are any changes.
                    </p>
                    ${isErgonomics ? `
                    <div style="background-color:#F4F7F9;border-radius:8px;padding:16px;margin-top:16px;margin-bottom:16px;">
                      <p style="color:#1E3560;font-size:14px;font-weight:700;margin:0 0 8px;">What to Bring</p>
                      <ul style="color:#4b5563;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
                        <li>Comfortable clothing</li>
                        <li>Water bottle</li>
                        <li>Yoga mat</li>
                      </ul>
                    </div>` : ''}
                    ${isNationalBoard ? `
                    <div style="background-color:#F4F7F9;border-radius:8px;padding:16px;margin-top:16px;">
                      <p style="color:#1E3560;font-size:14px;font-weight:700;margin:0 0 8px;">What to Bring — Clinical Attire Required</p>
                      <ul style="color:#4b5563;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
                        <li>Scrubs</li>
                        <li>Safety glasses (loops are an option)</li>
                        <li>Indoor shoes with closed toe and heel</li>
                        <li>Scrub cap or cultural headcover</li>
                        <li>Candidate handbook (can be downloaded from the NDAEB website)</li>
                      </ul>
                    </div>` : ''}
                    <p style="color:#374151;font-size:14px;line-height:1.6;margin-top:16px;">
                      If you have any questions,
                      <a href="https://westerndentalacademy.com/contact" style="color:#378ADD;">contact us here</a>
                      or email us at
                      <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>.
                    </p>
                  </div>
                  <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
                    <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
                  </div>
                </div>
              `,
            });

            // Notify admin
            await resend.emails.send({
              from: "Western Dental Academy <info@westerndentalacademy.com>",
              to: "info@westerndentalacademy.com",
              subject: `New Workshop Registration: ${firstName} — ${workshop}`,
              html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                  <div style="background-color:#1E3560;padding:24px 32px;">
                    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">New Workshop Registration</h1>
                    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:14px;">Western Dental Academy</p>
                  </div>
                  <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
                    <p style="color:#16a34a;font-weight:600;font-size:14px;margin-bottom:20px;">✓ Payment confirmed</p>
                    <table style="width:100%;border-collapse:collapse;">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:130px;">Name</td>
                        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#1E3560;font-size:13px;font-weight:600;">${firstName}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Email</td>
                        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;"><a href="mailto:${email}" style="color:#378ADD;">${email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;color:#6b7280;font-size:13px;">Workshop</td>
                        <td style="padding:10px 0;color:#1E3560;font-size:13px;font-weight:600;">${workshop}</td>
                      </tr>
                    </table>
                    <div style="margin-top:24px;">
                      <a href="https://westerndentalacademy.com/studio/structure/workshopRegistration"
                         style="background-color:#E67E22;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
                        View in Sanity Studio →
                      </a>
                    </div>
                  </div>
                  <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
                  </div>
                </div>
              `,
            });
          }
        }
      }
    } catch (err) {
      console.error("Workshop success page error:", err);
      // Show generic confirmation — Stripe only sends to success_url on actual payment
      confirmed = true;
    }
  }

  return (
    <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
      <div className="max-w-xl mx-auto px-6">
        <div
          className="rounded-2xl p-10 sm:p-14 text-center"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid rgba(30,53,96,0.09)",
            boxShadow: "0 4px 24px rgba(30,53,96,0.06)",
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full mx-auto mb-7 flex items-center justify-center"
            style={{ backgroundColor: "rgba(74,159,212,0.12)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4A9FD4"
              strokeWidth={2.25}
              className="w-8 h-8"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold text-[#1E3560] mb-3"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {confirmed ? "Registration Confirmed!" : "Thank You!"}
          </h1>

          {workshop && (
            <p
              className="text-sm font-semibold mb-4 px-4 py-2 rounded-full inline-block"
              style={{ backgroundColor: "rgba(74,159,212,0.1)", color: "#1E3560" }}
            >
              {workshop}
            </p>
          )}

          <p
            className="text-sm leading-relaxed max-w-sm mx-auto mb-2"
            style={{ color: "rgba(43,48,58,0.7)" }}
          >
            {firstName ? (
              <>
                Thank you, <strong className="text-[#1E3560]">{firstName}</strong>.{" "}
              </>
            ) : (
              "Thank you. "
            )}
            {confirmed
              ? "Your payment has been received and your spot is confirmed."
              : "Your registration has been received."}
          </p>

          <p
            className="text-sm leading-relaxed max-w-sm mx-auto mb-6"
            style={{ color: "rgba(43,48,58,0.7)" }}
          >
            Our team will be in touch to confirm your workshop date and share any preparation details.
          </p>

          {/* Spam notice */}
          <div
            className="mb-8 rounded-lg px-4 py-3 text-sm text-left"
            style={{
              backgroundColor: "rgba(230,126,34,0.08)",
              border: "1px solid rgba(230,126,34,0.2)",
            }}
          >
            <p style={{ color: "#1E3560" }}>
              <strong>📬 Check your junk/spam folder</strong> — confirmation emails sometimes end up
              there. Add <strong>info@westerndentalacademy.com</strong> to your contacts.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors duration-200 hover:border-[#1E3560] hover:text-[#1E3560]"
              style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
            >
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17]"
              style={{ backgroundColor: "#E67E22" }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
