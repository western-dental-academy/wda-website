import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Programs")
        .schemaType("program")
        .child(S.documentTypeList("program").title("Programs")),
      S.listItem()
        .title("Team Members")
        .schemaType("teamMember")
        .child(S.documentTypeList("teamMember").title("Team Members")),
      S.listItem()
        .title("Testimonials")
        .schemaType("testimonial")
        .child(S.documentTypeList("testimonial").title("Testimonials")),
      S.listItem()
        .title("Blog Posts")
        .schemaType("blogPost")
        .child(S.documentTypeList("blogPost").title("Blog Posts")),
      S.listItem()
        .title("FAQ")
        .schemaType("faqItem")
        .child(S.documentTypeList("faqItem").title("FAQ")),
      S.listItem()
        .title("Students")
        .schemaType("student")
        .child(S.documentTypeList("student").title("Students")),
        S.listItem()
        .title('Subscribers')
        .schemaType('subscriber')
        .child(S.documentTypeList('subscriber').title('Subscribers')),
        S.listItem()
        .title('Announcements')
        .schemaType('announcement')
        .child(S.documentTypeList('announcement').title('Announcements')),

      S.divider(),

      S.listItem()
        .title('Workshops')
        .child(
          S.list()
            .title('Workshops')
            .items([
              S.listItem()
                .title('Workshop Dates')
                .schemaType('workshopDate')
                .child(S.documentTypeList('workshopDate').title('Workshop Dates')),
              S.listItem()
                .title('Workshop Registrations')
                .schemaType('workshopRegistration')
                .child(S.documentTypeList('workshopRegistration').title('Workshop Registrations')),
            ])
        ),

      S.divider(),

      S.listItem()
        .title('Staff Time Tracking')
        .child(
          S.list()
            .title('Staff Time Tracking')
            .items([
              S.listItem()
                .title('Staff Members')
                .schemaType('staffMember')
                .child(S.documentTypeList('staffMember').title('Staff Members')),
              S.listItem()
                .title('Hours Log')
                .schemaType('hoursLog')
                .child(S.documentTypeList('hoursLog').title('Hours Log')),
              S.listItem()
                .title('Time-Off Requests')
                .schemaType('timeOffRequest')
                .child(S.documentTypeList('timeOffRequest').title('Time-Off Requests')),
            ])
        ),

      S.divider(),

      S.listItem()
        .title('Tasks')
        .schemaType('task')
        .child(S.documentTypeList('task').title('Tasks')),
    ]);