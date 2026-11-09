// Shared pieces of workshop emails (confirmation and reminders).

export function workshopInstructions(workshop: string): string {
  if (workshop.includes("Ergonomics in Healthcare")) {
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
          <li>Safety glasses (loupes are an option)</li>
          <li>Indoor shoes with closed toe and heel</li>
          <li>Scrub cap or cultural headcover</li>
          <li>Candidate handbook (can be downloaded from the NDAEB website)</li>
        </ul>
      </div>`;
  }
  return "";
}
