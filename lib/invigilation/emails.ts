import { accommodationLabel, addDays, formatDateLong, formatHour, formatTimeRange, hourOf } from './settings'

export interface InvigilationBookingRecord {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  date: string
  startTime: string
  durationHours: number
  institution?: string
  examName?: string
  examFormat?: 'computer' | 'paper'
  accommodations?: string[]
  accommodationNotes?: string
  instructorName?: string
  instructorEmail?: string
  instructorPhone?: string
  notes?: string
  price?: number
  stripePaymentStatus?: string
}

const ADDRESS = '150 Chippewa Road, Suite 258, Sherwood Park, AB'
const PHONE = '780-499-9153'
const OFFICE_EMAIL = 'info@westerndentalacademy.com'

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function materialsDeadline(b: Pick<InvigilationBookingRecord, 'date' | 'startTime'>): string {
  return `${formatDateLong(addDays(b.date, -2))} at ${formatHour(hourOf(b.startTime))}`
}

function shell(title: string, body: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background-color:#1E3560;padding:28px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">${title}</h1>
        <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">${body}</div>
      <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
      </div>
    </div>`
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:150px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#1E3560;font-size:13px;font-weight:600;">${value}</td>
    </tr>`
}

function box(heading: string, items: string[], accent = false): string {
  return `
    <div style="background-color:${accent ? '#FFF7ED' : '#F4F7F9'};border-radius:8px;padding:16px;margin:16px 0;${accent ? 'border-left:4px solid #E67E22;' : ''}">
      <p style="color:#1E3560;font-size:14px;font-weight:700;margin:0 0 8px;">${heading}</p>
      <ul style="color:#4b5563;font-size:14px;line-height:1.7;margin:0;padding-left:20px;">
        ${items.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>`
}

function accommodationsText(b: InvigilationBookingRecord): string {
  const list = (b.accommodations ?? []).map(accommodationLabel)
  if (!list.length) return 'None'
  return esc(list.join(', ')) + (b.accommodationNotes ? `<br><span style="font-weight:400;color:#4b5563;">${esc(b.accommodationNotes)}</span>` : '')
}

function bookingTable(b: InvigilationBookingRecord): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:0 0 8px;">
      ${row('Date', esc(formatDateLong(b.date)))}
      ${row('Time', `${esc(formatTimeRange(b.startTime, b.durationHours))} (${b.durationHours} hr)`)}
      ${row('Exam', esc(b.examName))}
      ${row('Institution', esc(b.institution))}
      ${row('Format', b.examFormat === 'computer' ? 'Computer-based' : 'Paper')}
      ${row('Accommodations', accommodationsText(b))}
      ${b.price != null ? row('Fee', `$${b.price.toFixed(2)} CAD + processing fee`) : ''}
    </table>`
}

const instructorItems = [
  'The exam password, or a paper copy of the exam sent to our office',
  'A list of acceptable items (for example scrap paper, ruler, calculator, formula sheets)',
  'A contact phone number or email we can reach if there are any issues during the exam',
]

export function studentConfirmationHtml(b: InvigilationBookingRecord): string {
  const deadline = materialsDeadline(b)
  const body = `
    <p style="color:#1E3560;font-size:15px;margin:0 0 16px;">Hi ${esc(b.firstName)},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Your exam invigilation is booked. Please keep this email — you'll need to show it when you arrive.
    </p>
    ${bookingTable(b)}
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:16px 0 0;">
      <strong style="color:#1E3560;">Location:</strong> Western Dental Academy classroom, ${ADDRESS}.
      Our classroom is on the second floor and there is no elevator.
    </p>

    ${box(`Your instructor or exam centre must send us by ${esc(deadline)}`, [
      ...instructorItems,
      `Please make sure they send these to <a href="mailto:${OFFICE_EMAIL}" style="color:#378ADD;">${OFFICE_EMAIL}</a>.`,
    ], true)}

    ${box('What to bring', [
      'Government-issued photo ID',
      'This confirmation email (printed or on your phone)',
      ...(b.examFormat === 'computer'
        ? [
            'A Windows or Mac laptop, fully charged, and its charger. Chromebooks and iPads are not supported.',
            'If your exam uses Safe Exam Browser (for example, CAEC exams), download and install it from <a href="https://safeexambrowser.org" style="color:#378ADD;">safeexambrowser.org</a> before you arrive and make sure it opens. Installing needs administrator access, so work- or school-managed laptops may not allow it; check ahead of time.',
          ]
        : ['Any items your instructor has approved for the exam']),
      'Any other items required for your exam',
    ])}

    ${box('Exam room rules', [
      'Exams are written in our classroom and supervised by instructional staff',
      'Phones and smartwatches must be turned off and stored in your bag',
      'Bags, coats and hats are left at the front of the room — no hats during the exam',
      'Only clear water bottles are permitted',
    ])}

    <p style="color:#374151;font-size:14px;line-height:1.6;margin-top:16px;">
      Western Dental Academy reserves the right to reschedule or cancel an appointment if needed. If this happens,
      we'll contact you as soon as possible to arrange a new time.
    </p>

    <p style="color:#374151;font-size:14px;line-height:1.6;margin-top:16px;">
      Need to change your booking or have a question? Email
      <a href="mailto:${OFFICE_EMAIL}" style="color:#378ADD;">${OFFICE_EMAIL}</a>
      or call ${PHONE}.
    </p>`
  return shell('Exam Invigilation Booked', body)
}

export function adminInvigilationHtml(b: InvigilationBookingRecord): string {
  const body = `
    <p style="color:#16a34a;font-weight:600;font-size:14px;margin:0 0 20px;">✓ Payment confirmed</p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Student', `${esc(b.firstName)} ${esc(b.lastName)}`)}
      ${row('Email', `<a href="mailto:${esc(b.email)}" style="color:#378ADD;">${esc(b.email)}</a>`)}
      ${row('Phone', esc(b.phone))}
    </table>
    ${bookingTable(b)}
    <table style="width:100%;border-collapse:collapse;">
      ${row('Instructor', esc(b.instructorName))}
      ${row('Instructor email', `<a href="mailto:${esc(b.instructorEmail)}" style="color:#378ADD;">${esc(b.instructorEmail)}</a>`)}
      ${b.instructorPhone ? row('Instructor phone', esc(b.instructorPhone)) : ''}
      ${b.notes ? row('Notes', esc(b.notes)) : ''}
      ${row('Materials due', esc(materialsDeadline(b)))}
    </table>
    <div style="margin-top:24px;">
      <a href="https://westerndentalacademy.com/studio/structure/examInvigilation"
         style="background-color:#E67E22;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
        View in Sanity Studio →
      </a>
    </div>`
  return shell('New Exam Invigilation Booking', body)
}
