export interface TutorialStep {
  caption: string;
  image: string;
}

export interface GuideTutorial {
  type: "guide";
  slug: string;
  title: string;
  description: string;
  status: "available";
  steps: TutorialStep[];
}

export interface VideoTutorial {
  type: "video";
  slug: string;
  title: string;
  description: string;
  status: "coming_soon";
}

export interface PlannedGuide {
  type: "guide";
  slug: string;
  title: string;
  description: string;
  status: "coming_soon";
}

export type Tutorial = GuideTutorial | VideoTutorial | PlannedGuide;

export const GUIDES: (GuideTutorial | PlannedGuide)[] = [
  {
    type: "guide",
    slug: "signing-in",
    title: "Signing in",
    description: "Google Workspace, a magic-link email, or a password -- and what to do if a link stops working.",
    status: "available",
    steps: [
      {
        image: "/tutorials/signin-01-page.png",
        caption:
          "Go to the login page. Internal staff use \"Continue with Google Workspace.\" External partners (architects, contractors, firm reviewers) use the email section below it.",
      },
      {
        image: "/tutorials/signin-02-password.png",
        caption:
          "If your account already has a password set, enter your email and password under \"or with a password\" and select Sign in with password.",
      },
      {
        image: "/tutorials/signin-03-forgot.png",
        caption:
          "Never set a password, or a sign-in link stopped working? Select \"Forgot your password, or never set one?\", enter your email, and a link to set one will be emailed to you.",
      },
    ],
  },
  {
    type: "guide",
    slug: "finding-your-way-around",
    title: "Finding your way around",
    description: "The guideline switcher, the account menu, and where notifications live.",
    status: "available",
    steps: [
      {
        image: "/tutorials/nav-01-header.png",
        caption:
          "The pill in the top center switches between Ambulatory, Acute, and Building Performance guidelines. Home, Projects, and Training are on the right, along with the notification bell and your account icon.",
      },
      {
        image: "/tutorials/nav-02-usermenu.png",
        caption:
          "Select the account icon (top right) to open Profile, My Certificates, and Sign out.",
      },
    ],
  },
  {
    type: "guide",
    slug: "submitting-a-deviation-request",
    title: "Submitting a deviation request",
    description: "How to request an exception to a standard on one of your projects.",
    status: "coming_soon",
  },
  {
    type: "guide",
    slug: "registering-a-project",
    title: "Registering a project",
    description: "For administrators: adding a project and locking it to a guideline edition.",
    status: "coming_soon",
  },
  {
    type: "guide",
    slug: "editing-room-content",
    title: "Editing room content as a content editor",
    description: "Updating Overview, Decision Logic, and Intentional Omissions on a room page.",
    status: "coming_soon",
  },
];

export const VIDEOS: VideoTutorial[] = [
  {
    type: "video",
    slug: "platform-overview",
    title: "Platform overview",
    description: "A full walkthrough of the Design Intelligence Platform, start to finish.",
    status: "coming_soon",
  },
  {
    type: "video",
    slug: "working-a-project",
    title: "Working a project, start to finish",
    description: "Registering a project, locking an edition, and tracking deviations.",
    status: "coming_soon",
  },
  {
    type: "video",
    slug: "admin-tools",
    title: "Admin tools",
    description: "Provisioning users, managing content editors, and the notification queue.",
    status: "coming_soon",
  },
];

export function findGuide(slug: string): GuideTutorial | undefined {
  const guide = GUIDES.find((g) => g.slug === slug);
  return guide?.status === "available" ? guide : undefined;
}
