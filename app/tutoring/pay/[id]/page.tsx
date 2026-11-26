import type { Metadata } from "next";
import Link from "next/link";
import TutoringPayButton from "@/components/tutoring/TutoringPayButton";
import { serviceTitle } from "@/lib/tutoring/shared";
import { getInquiry } from "@/lib/tutoring/server";

export const metadata: Metadata = {
  title: "Pay for Your Session",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
      <div className="max-w-xl mx-auto px-6">
        <div
          className="rounded-2xl p-8 sm:p-12 bg-white"
          style={{ border: "1.5px solid rgba(30,53,96,0.09)", boxShadow: "0 4px 24px rgba(30,53,96,0.06)" }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

const heading = "text-2xl font-bold mb-3 text-[#1E3560]";
const montserrat = { fontFamily: "var(--font-montserrat), sans-serif" };

export default async function TutoringPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string; cancelled?: string }>;
}) {
  const [{ id }, { t, cancelled }] = await Promise.all([params, searchParams]);
  const inquiry = await getInquiry(id);
  const valid = inquiry && inquiry.payToken && t === inquiry.payToken;

  if (!inquiry || !valid) {
    return (
      <Card>
        <h1 className={heading} style={montserrat}>Payment link not found</h1>
        <p className="text-sm leading-relaxed text-[#2B303A]/75">
          This link may have expired or been replaced by a newer one. Please check your latest email from us, or call{" "}
          <a href="tel:5872691644" className="font-semibold text-[#4A9FD4]">587-269-1644</a>.
        </p>
      </Card>
    );
  }

  if (inquiry.status === "paid") {
    return (
      <Card>
        <h1 className={heading} style={montserrat}>Already paid</h1>
        <p className="text-sm leading-relaxed text-[#2B303A]/75">
          Thank you, {inquiry.firstName}. This session has been paid and a receipt was sent to {inquiry.email}.
        </p>
      </Card>
    );
  }

  const active = inquiry.status === "payment-requested" && !!inquiry.amount && !!inquiry.hours;
  const rows: [string, string][] = [
    ...(inquiry.assignedTo ? [["Instructor", inquiry.assignedTo] as [string, string]] : []),
    ...(inquiry.sessionDetails ? [["Session", inquiry.sessionDetails] as [string, string]] : []),
    ["Hours", String(inquiry.hours ?? "")],
    ["Total", `$${(inquiry.amount ?? 0).toFixed(2)} CAD`],
  ];

  return (
    <Card>
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
        {serviceTitle(inquiry.service)}
      </p>
      <h1 className={heading} style={montserrat}>Hi {inquiry.firstName}, your session is ready</h1>

      {cancelled === "1" && (
        <p className="text-xs font-medium mb-5 px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(230,126,34,0.1)", color: "#a85a12" }}>
          Payment was not completed. You can try again below.
        </p>
      )}

      {active ? (
        <>
          <dl className="my-6 rounded-xl overflow-hidden text-sm" style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}>
            {rows.map(([k, v]) => (
              <div key={k} className="flex gap-4 px-5 py-3 border-b last:border-b-0" style={{ borderColor: "rgba(30,53,96,0.07)" }}>
                <dt className="w-24 shrink-0 text-[#2B303A]/55">{k}</dt>
                <dd className="font-semibold text-[#1E3560] whitespace-pre-wrap">{v}</dd>
              </div>
            ))}
          </dl>
          <TutoringPayButton id={inquiry._id} token={t!} label={`Pay $${(inquiry.amount ?? 0).toFixed(2)}`} />
          <p className="text-xs mt-4 text-center text-[#2B303A]/50">
            Something not right? Reply to our email or call 587-269-1644 before paying.
          </p>
        </>
      ) : (
        <p className="text-sm leading-relaxed text-[#2B303A]/75">
          This payment link is no longer active. Please contact us at{" "}
          <a href="tel:5872691644" className="font-semibold text-[#4A9FD4]">587-269-1644</a> for a new one.
        </p>
      )}

      <p className="text-xs mt-8 text-center">
        <Link href="/tutoring" className="text-[#4A9FD4] font-semibold">About tutoring &amp; coaching</Link>
      </p>
    </Card>
  );
}
