// The privacy policy. Google requires one before an OAuth client can be
// published to production, and the platform's backups write to Google Drive
// through that client. Kept to what is TRUE: the join flow is live (at
// /join/apply, unlinked until site.joinOpen), so its processing is described
// here whether or not the site advertises it. Move `updated` with any change.
export const updated = "2026-11-21";

export const intro = {
  title: "Privacy",
  paragraphs: [
    "Invariant Platform is run by one person and has no customers to profile. This page says what it collects, and why.",
  ],
};

interface Section {
  title: string;
  body: string[];
}

// PIPEDA: what, why, where, how long, how to have it deleted. CASL: express
// consent, sender identified, an unsubscribe in every message (the provider
// adds it). ADR-185, ADR-210.
const website: Section[] = [
  {
    title: "This website",
    body: [
      "Reading the public pages sets no cookies and loads no analytics script or third-party tracker. Nothing is stored in your browser.",
      "Page views are counted on the server, by the same Worker that serves the page: for each page, the path, the site that linked to it (its name only, such as linkedin.com) and the country Cloudflare reports. No IP address, browser details or anything else that could identify a visitor is kept, and members pages are not counted. The counts are kept in Cloudflare Workers Analytics Engine for at most three months.",
      "It is served by Cloudflare, which processes standard request data (IP address, user agent, the page requested) to deliver and protect the site, under Cloudflare's own privacy policy. This site keeps none of it beyond the page-view counts above.",
    ],
  },
  {
    title: "Joining",
    body: [
      "Joining asks you to sign in with GitHub and to type an email address. From GitHub the site learns your username and account number, nothing else. It asks for no permissions on your account and does not keep the sign-in token.",
      "Your address goes to Buttondown, the newsletter service that holds the list, with your GitHub username and account number, the consent wording you agreed to and when, and your IP address, which Buttondown uses to filter out spam sign-ups. Buttondown sends the confirmation email, and every message after it carries an unsubscribe link. Buttondown's own privacy policy covers how it stores the list.",
      "Once you confirm, the platform's GitHub App invites your account to the InvariantPlatform organization. GitHub keeps the membership, and members are private by default.",
      "The address is used for access and for the occasional email you agreed to. Nothing is sold, shared for advertising, or used to train AI models.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "Joining and the members pages set three cookies. All are strictly necessary, signed, and unreadable by page script: one that lasts ten minutes during sign-in; a session that lasts seven days, holding your GitHub username and number and whether you are a member; and a note of the address you gave, kept thirty days so the confirmation step can find it. Signing out clears the session.",
    ],
  },
  {
    title: "How long, and deleting it",
    body: [
      "You stay on the list until you unsubscribe, and in the organization until you leave it, unsubscribe, or ask to be removed. Unsubscribing ends the membership too: Buttondown tells the site, which checks with Buttondown that you really left the list and then removes your account from the organization. Re-subscribing does not bring it back; join again instead.",
      "To have everything deleted, ask through the author's site, linked in the footer, and both the list entry and the membership are removed.",
    ],
  },
];

const always: Section[] = [
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
      "If anything here changes, this page is updated before the change goes live, and the date below moves with it.",
      "Questions go to the operator through the author's site, linked in the footer.",
    ],
  },
];

export function sections(): Section[] {
  return [...website, ...always];
}
