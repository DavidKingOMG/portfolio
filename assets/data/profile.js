export const profile = {
  identity: {
    name: "David Moya",
    roleLine: "Software Engineer \u00B7 Cybersecurity Specialist \u00B7 Systems Architect",
    eyebrow: "VAULT ID: 0x0000 - VERIFIED // AUTHORIZED",
    intro:
      "Building practical software, web systems, and IT solutions with a focus on clean execution, strong usability, and real-world problem solving."
  },

  about: {
    title: "Personal Dossier",
    paragraphs: [
      "I'm a builder focused on web systems, software, and hands-on IT problem solving. I like creating tools and experiences that are clean, useful, and built for real people and real workflows.",
      "My background comes from working closely with businesses where technology had to solve practical problems, whether that meant building websites, managing internal systems, organizing data, improving workflows, or stepping in to handle day-to-day technical issues.",
      "This portfolio is designed to grow with me. As I continue building projects, sharpening my skills, and taking on new work, this archive will expand into a stronger record of the systems, tools, and solutions I've created."
    ]
  },

  stats: [
    { value: "0", label: "Years Active", dynamic: "yearsActive" },
    { value: "10", label: "Projects" },
    { value: "3", label: "Certifications" },
    { value: "Full-Time + Freelance", label: "Availability" }
  ],

  links: {
    email: "mailto:davidmoya1309@gmail.com",
    linkedin: "https://www.linkedin.com/in/is-david-moya/",
    github: "https://github.com/DavidKingOMG"
  },

  projects: [
    {
      id: "001",
      title: "Flow",
      description:
        "A secure, admin-first business dashboard for multi-client operations with role-based access, invoice and recurring billing workflows, payment tracking, and a premium dark dashboard interface.",
      tags: ["Next.js", "TypeScript", "Prisma", "NextAuth", "Stripe"],
      href: "https://flow-beta-bice.vercel.app/",
      featured: true
    },
    {
      id: "002",
      title: "Wildfire Intelligence Tracker",
      description:
        "A real-world monitoring dashboard powered by NASA wildfire data with map layers, date-range playback, risk summaries, saved regions, alert workflows, and a clean control-focused interface.",
      tags: ["React", "NASA API", "Maps", "Dashboard", "Data Visualization"],
      href: "",
      featured: true
    },
    {
      id: "003",
      title: "Specialized AI Assistant",
      description:
        "A niche chatbot application designed around guided conversations, backend prompt handling, conversation history, document upload, and a tool panel that keeps the experience practical and task-focused.",
      tags: ["Python", "Chatbot", "Prompt Design", "Backend Logic", "UI Flow"],
      href: "",
      featured: false
    },
    {
      id: "004",
      title: "Secure Document Workspace",
      description:
        "A document management platform inspired by cloud-drive workflows, focused on secure storage, role-based access, upload previews, folder trees, search, activity logs, and controlled sharing.",
      tags: ["React", "Firebase", "Auth", "Storage", "Permissions"],
      href: "",
      featured: false
    },
    {
      id: "005",
      title: "Adaptive Training Planner",
      description:
        "A fitness automation platform that generates personalized workout plans, tracks streaks, schedules sessions on a calendar, and adapts recommendations around user goals and consistency.",
      tags: ["Python", "Automation", "Email", "Scheduling", "Personalization"],
      href: "",
      featured: false
    },
    {
      id: "006",
      title: "Freelancer Invoice Toolkit",
      description:
        "A business-ready invoicing application with PDF export, recurring billing, tax settings, payment tracking, analytics, and lightweight client management for freelancers and small teams.",
      tags: ["Vue 3", "Vuex", "Firebase", "PDF Export", "Business Tools"],
      href: "",
      featured: false
    }
  ],

  skills: [
    {
      category: "Software",
      items: ["JavaScript", "TypeScript", "Problem Solving", "Application Architecture"]
    },
    {
      category: "Systems",
      items: ["Prisma", "PostgreSQL (Supabase)", "Database Management", "Authentication Flows"]
    },
    {
      category: "Web",
      items: ["Next.js", "React", "Tailwind CSS", "Business Websites"]
    },
    {
      category: "Operations",
      items: ["Stripe Integrations", "Playwright", "Vitest", "Day-to-Day Execution"]
    }
  ],

  experience: [
    {
      dates: "2020 - Present",
      role: "Systems, Logistics & IT Support",
      company: "YDY Transport LLC",
      description:
        "Supported day-to-day business operations through dispatch and logistics tracking, company email setup, printer and network system support, website development, and general IT troubleshooting. Built and maintained a custom internal data system to help organize business information and improve operational workflow.",
      badge: "Current",
      startYear: 2020
    },
    {
      dates: "2022 - 2026",
      role: "Operator & Business Web/Systems Specialist",
      company: "Elite Leads, INC.",
      description:
        "Worked across operations, web systems, and internal business tools for a lead generation company. Contributed to the company website, built and managed CRM-related workflows, handled large-scale data organization, and supported communication with businesses and clients while helping maintain the technical side of daily operations.",
      badge: "Verified",
      startYear: 2022,
      endYear: 2026
    }
  ]
};
