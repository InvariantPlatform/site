// The privacy policy. Google requires one before an OAuth client can be
// published to production, and the platform's backups write to Google Drive
// through that client. Kept to what is TRUE today: if the members gate opens,
// this page changes in the same release (it will then set a sign-in cookie).
export const updated = "2026-11-11";

export const intro = {
  title: "Privacy",
  paragraphs: [
    "Invariant Platform is one person's infrastructure, not a service with users. This page says exactly what it collects, which today is almost nothing.",
  ],
};

export const sections = [
  {
    title: "This website",
    body: [
      "The site sets no cookies, runs no analytics and loads no third-party trackers. There are no accounts and no forms that submit anything.",
      "It is served by Cloudflare, which processes standard request data (IP address, user agent, the page requested) to deliver and protect the site, under Cloudflare's own privacy policy. This site does not receive or keep that data.",
    ],
  },
  {
    title: "The Google OAuth client",
    body: [
      "The \"Invariant Platform\" Google OAuth client is used only by the platform's own backup jobs, signed in to the operator's own Google account. It is not offered to anyone else, and no other person's Google data is requested or accessed.",
      "Through Google Drive it creates, reads and deletes the platform's backup files in that account. The backups are encrypted before they leave the platform. Nothing from Google Drive is shared, sold, used for advertising, or used to train AI models.",
      "Use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
    ],
  },
  {
    title: "Changes and contact",
    body: [
      "If anything here changes, for example when membership opens, this page is updated before the change goes live, and the date below moves with it.",
      "Questions go to the operator through the author's site, linked in the footer.",
    ],
  },
];
