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

interface RegistrationRecord {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  workshop: string;
  workshopDateId: string | null;
  stripePaymentStatus: string;
  preferredDate?: string;
  deliveryMethod?: string;
}

function workshopInstructions(workshop: string): string {
  if (workshop.includes("Ergonomics in Dentistry")) {
    return `
      <div style="background-color:#F4F7F9;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#1E3560;font-size:14px;font-weight:700;margin:0 0 8px;">What to Bring</p>
        <ul style="color:#4b5563;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
          <li>Comfortable clothing</li>
          <li>Water bottle</li>
          <li>Yoga mat</li>
        </ul>
      </div>`;
  }
  if (workshop.includes("National Board")) {
    return `
      <div style="background-color:#F4F7F9;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#1E3560;font-size:14px;font-weight:700;margin:0 0 8px;">What to Bring — Clinical Attire Required</p>
        <ul style="color:#4b5563;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
          <li>Scrubs</li>
          <li>Safety glasses (loops are an option)</li>
          <li>Indoor shoes with closed toe and heel</li>
          <li>Scrub cap or cultural headcover</li>
          <li>Candidate handbook (can be downloaded from the NDAEB website)</li>
        </ul>
      </div>`;
  }
  return "";
}

function confirmationEmailHtml(
  firstName: string,
  workshop: string,
  formattedDate: string,
  deliveryMethod?: string,
  zoomLink?: string,
): string {
  const isVirtual = deliveryMethod === 'virtual';

  const virtualSection = isVirtual
    ? `<div style="background-color:#EFF6FF;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #378ADD;">
        <p style="color:#1E3560;font-size:14px;font-weight:700;margin:0 0 6px;">Virtual Attendance — Zoom Link</p>
        ${zoomLink
          ? `<p style="font-size:14px;margin:0;"><a href="${zoomLink}" style="color:#378ADD;">${zoomLink}</a></p>`
          : `<p style="color:#374151;font-size:14px;margin:0;">Your Zoom link will be sent to you by our team prior to the event. If you have not received it 24 hours before, please contact us.</p>`
        }
      </div>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background-color:#1E3560;padding:28px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Registration Confirmed</h1>
        <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
        <p style="color:#1E3560;font-size:15px;margin:0 0 16px;">Hi ${firstName},</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px;">
          ${isVirtual ? "You're registered to attend virtually!" : "You're registered! We look forward to seeing you at the event."}
        </p>
        <p style="color:#1E3560;font-size:16px;font-weight:700;margin:0 0 8px;">${workshop}</p>
        ${formattedDate ? `<p style="color:#374151;font-size:14px;margin:0 0 4px;">${formattedDate}</p>` : ""}
        ${isVirtual ? `<p style="font-size:13px;font-weight:600;margin:0 0 16px;"><span style="background-color:#EFF6FF;color:#378ADD;padding:2px 8px;border-radius:4px;">Virtual</span></p>` : `<p style="margin:0 0 16px;"></p>`}
        ${virtualSection}
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Our team will be in touch if there are any changes.
        </p>
        ${!isVirtual ? workshopInstructions(workshop) : ''}
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
    </div>`;
}

function receiptEmailHtml(
  primaryFirstName: string,
  rows: { name: string; workshop: string; date: string; price: number; delivery?: string }[],
  totalPaid: number,
): string {
  const subtotal = rows.reduce((s, r) => s + r.price, 0);
  const fee = totalPaid - subtotal;

  const tableRows = rows.map(r => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#1E3560;font-size:13px;font-weight:600;">${r.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;">${r.workshop}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;">${r.date}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">${r.delivery === 'virtual' ? '<span style="background-color:#EFF6FF;color:#378ADD;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:600;">Virtual</span>' : '<span style="background-color:#EEF2FF;color:#1E3560;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:600;">In-Person</span>'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;text-align:right;">$${r.price.toFixed(2)}</td>
    </tr>`).join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background-color:#1E3560;padding:28px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Registration Receipt</h1>
        <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
        <p style="color:#1E3560;font-size:15px;margin:0 0 16px;">Hi ${primaryFirstName},</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Thank you for your registration. Here is a summary of everyone you registered.
          Individual confirmation emails have been sent to each attendee.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background-color:#F4F7F9;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Registrant</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Workshop</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Date</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Delivery</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:10px 12px;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6;">Subtotal</td>
              <td style="padding:10px 12px;font-size:13px;color:#374151;text-align:right;border-top:1px solid #f3f4f6;">$${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:10px 12px;font-size:13px;color:#6b7280;">Processing fee</td>
              <td style="padding:10px 12px;font-size:13px;color:#374151;text-align:right;">$${fee.toFixed(2)}</td>
            </tr>
            <tr style="background-color:#F4F7F9;">
              <td colspan="3" style="padding:12px 12px;font-size:14px;font-weight:700;color:#1E3560;">Total Paid</td>
              <td style="padding:12px 12px;font-size:14px;font-weight:700;color:#1E3560;text-align:right;">$${totalPaid.toFixed(2)} CAD</td>
            </tr>
          </tfoot>
        </table>
        <p style="color:#374151;font-size:14px;line-height:1.6;">
          Questions? <a href="https://westerndentalacademy.com/contact" style="color:#378ADD;">Contact us here</a>
          or email <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>.
        </p>
      </div>
      <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
      </div>
    </div>`;
}

function adminEmailHtml(
  registrations: RegistrationRecord[],
  dates: Record<string, string>,
): string {
  const rows = registrations.map(r => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#1E3560;font-size:13px;font-weight:600;">${r.firstName} ${r.lastName}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;">${r.workshop}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;"><a href="mailto:${r.email}" style="color:#378ADD;">${r.email}</a></td>
    </tr>`).join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background-color:#1E3560;padding:24px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">New Workshop Registration${registrations.length > 1 ? ` (${registrations.length} attendees)` : ""}</h1>
        <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:14px;">Western Dental Academy</p>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
        <p style="color:#16a34a;font-weight:600;font-size:14px;margin-bottom:20px;">✓ Payment confirmed</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;font-size:12px;color:#6b7280;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Name</th>
              <th style="text-align:left;font-size:12px;color:#6b7280;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Workshop</th>
              <th style="text-align:left;font-size:12px;color:#6b7280;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Email</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
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
    </div>`;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; id?: string; ids?: string }>;
}) {
  const { session_id: sessionId, id: legacyId, ids: idsRaw } = await searchParams;

  // Support both new multi-registrant (?ids=) and legacy single-registrant (?id=)
  const ids = idsRaw
    ? idsRaw.split(",").filter(Boolean)
    : legacyId
    ? [legacyId]
    : [];

  const isLegacy = !!legacyId && !idsRaw;

  let registrations: RegistrationRecord[] = [];
  let confirmed = false;
  let totalPaidCents = 0;

  if (sessionId && ids.length > 0) {
    try {
      // Fetch all registrations
      const idList = ids.map(id => `"${id}"`).join(",");
      const existing = await sanity.fetch<RegistrationRecord[]>(
        `*[_id in [${idList}]]{ _id, firstName, lastName, email, workshop, workshopDateId, stripePaymentStatus, preferredDate, deliveryMethod }`,
      );
      registrations = existing;

      if (registrations.length > 0 && registrations[0].stripePaymentStatus === "paid") {
        // Already processed — idempotent
        confirmed = true;
      } else {
        // Verify payment with Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          totalPaidCents = session.amount_total ?? 0;

          // Mark all as paid
          await Promise.all(
            ids.map(id =>
              sanity.patch(id).set({ stripePaymentStatus: "paid" }).commit()
            )
          );
          confirmed = true;

          // Fetch workshop dates for formatted date strings
          const dateIds = [...new Set(
            registrations.map(r => r.workshopDateId).filter(Boolean) as string[]
          )];
          const dateMap: Record<string, string> = {};
          const zoomMap: Record<string, string | null> = {};
          const virtualPriceMap: Record<string, number | null> = {};
          if (dateIds.length > 0) {
            const dateResults = await sanity.fetch<{ _id: string; date: string; zoomLink?: string; virtualPrice?: number }[]>(
              `*[_type == "workshopDate" && _id in [${dateIds.map(id => `"${id}"`).join(",")}]]{ _id, date, "zoomLink": offering->zoomLink, "virtualPrice": offering->virtualPrice }`,
            );
            for (const d of dateResults) {
              dateMap[d._id] = new Date(d.date).toLocaleString("en-CA", {
                timeZone: "America/Edmonton",
                weekday: "long", year: "numeric", month: "long", day: "numeric",
                hour: "numeric", minute: "2-digit", timeZoneName: "short",
              });
              zoomMap[d._id] = d.zoomLink ?? null;
              virtualPriceMap[d._id] = d.virtualPrice ?? null;
            }
          }

          // Send individual confirmation emails
          await Promise.all(
            registrations.map(r => {
              const formattedDate = r.workshopDateId ? dateMap[r.workshopDateId] ?? "" : "";
              const zoomLink = r.workshopDateId ? zoomMap[r.workshopDateId] ?? undefined : undefined;
              return resend.emails.send({
                from: "Western Dental Academy <info@westerndentalacademy.com>",
                to: r.email,
                subject: `Registration Confirmed — ${r.workshop}`,
                html: confirmationEmailHtml(r.firstName, r.workshop, formattedDate, r.deliveryMethod, zoomLink),
              });
            })
          );

          // Send receipt to primary registrant (first in list)
          const primary = registrations[0];
          if (registrations.length > 1 || !isLegacy) {
            const basePrices: Record<string, number> = {
              "Ergonomics in Dentistry: Hands, Feet and Spine": 40,
              "Ergonomics in Dentistry: Hips and Hamstrings": 40,
              "Ergonomics in Dentistry: Neck and Shoulders": 40,
              "National Board Guided Practice Workshop": 600,
              "Renewal Wellness Workshop": 129,
            };
            const receiptRows = registrations.map(r => {
              const isVirtual = r.deliveryMethod === 'virtual';
              const vp = r.workshopDateId ? virtualPriceMap[r.workshopDateId] : null;
              const price = isVirtual && vp != null ? vp : (basePrices[r.workshop] ?? 0);
              return {
                name: `${r.firstName} ${r.lastName}`,
                workshop: r.workshop,
                date: r.workshopDateId ? dateMap[r.workshopDateId] ?? "TBD" : "TBD",
                delivery: r.deliveryMethod,
                price,
              };
            });
            const totalPaidDollars = totalPaidCents / 100;
            await resend.emails.send({
              from: "Western Dental Academy <info@westerndentalacademy.com>",
              to: primary.email,
              subject: `Registration Receipt — ${registrations.length} Attendee${registrations.length > 1 ? "s" : ""}`,
              html: receiptEmailHtml(primary.firstName, receiptRows, totalPaidDollars),
            });
          }

          // Admin notification
          await resend.emails.send({
            from: "Western Dental Academy <info@westerndentalacademy.com>",
            to: "info@westerndentalacademy.com",
            subject: `New Workshop Registration${registrations.length > 1 ? ` (${registrations.length} attendees)` : ""}: ${primary.firstName} ${primary.lastName}`,
            html: adminEmailHtml(registrations, dateMap),
          });
        }
      }
    } catch (err) {
      console.error("Workshop success page error:", err);
      confirmed = true; // Stripe only sends to success_url on actual payment
    }
  }

  const primary = registrations[0];
  const isMultiple = registrations.length > 1;

  return (
    <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
      <div className="max-w-2xl mx-auto px-6">
        <div
          className="rounded-2xl p-10 sm:p-14"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid rgba(30,53,96,0.09)",
            boxShadow: "0 4px 24px rgba(30,53,96,0.06)",
          }}
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-full mx-auto mb-7 flex items-center justify-center" style={{ backgroundColor: "rgba(74,159,212,0.12)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth={2.25} className="w-8 h-8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold text-center mb-3"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {confirmed ? "Registration Complete!" : "Thank You!"}
          </h1>

          {confirmed && isMultiple && (
            <p className="text-center text-sm mb-6" style={{ color: "rgba(43,48,58,0.65)" }}>
              Confirmation emails have been sent to all {registrations.length} registrants.
            </p>
          )}

          {confirmed && !isMultiple && primary && (
            <p className="text-center text-sm mb-6" style={{ color: "rgba(43,48,58,0.65)" }}>
              Thank you, <strong style={{ color: "#1E3560" }}>{primary.firstName}</strong>.{" "}
              Your payment has been received and your spot is confirmed.
            </p>
          )}

          {/* Registrant list */}
          {registrations.length > 0 && (
            <div className="mb-6 rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}>
              <div className="px-5 py-3" style={{ backgroundColor: "#1E3560" }}>
                <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}>
                  {isMultiple ? `${registrations.length} Registrants` : "Your Registration"}
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: "rgba(30,53,96,0.07)" }}>
                {registrations.map((r, i) => (
                  <div key={r._id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold" style={{ color: "#1E3560" }}>
                        {r.firstName} {r.lastName}
                      </p>
                      {i === 0 && isMultiple && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(230,126,34,0.1)", color: "#E67E22" }}>
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "rgba(43,48,58,0.55)" }}>{r.workshop}</p>
                    {r.preferredDate && (
                      <p className="text-xs mt-0.5" style={{ color: "rgba(43,48,58,0.4)" }}>{r.preferredDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spam notice */}
          <div
            className="mb-8 rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: "rgba(230,126,34,0.08)", border: "1px solid rgba(230,126,34,0.2)" }}
          >
            <p style={{ color: "#1E3560" }}>
              <strong>📬 Check your junk/spam folder</strong> — confirmation emails sometimes end up
              there. Add <strong>info@westerndentalacademy.com</strong> to your contacts.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors hover:border-[#1E3560] hover:text-[#1E3560]"
              style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
            >
              Back to Home
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors hover:border-[#1E3560] hover:text-[#1E3560]"
              style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
            >
              Register More
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#CF6D17]"
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
