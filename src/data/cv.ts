/** Single source of truth. The route, the project cards, the command palette and the print CV all read this. */

export interface Job {
  id: string;
  company: string;
  role: string;
  from: string;
  to: string;
  place: string;
  blurb: string;
  highlights: string[];
  stack: string[];
  color: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  /** Absent for a project with nothing to run in a browser; its case study shows the text only. */
  demoUrl?: string;
  repoUrl: string;
  color: string;
}

export interface Link {
  label: string;
  href: string;
}

export const profile = {
  name: 'Veronika Rosicova',
  role: 'Frontend engineer · React Native & React',
  location: 'Edinburgh',
  availability: 'Available now · Hybrid, remote or on-site',
  summary:
    'I build React Native and React apps that are well tested and accessible. Most recently the mobile app for an AI-driven financial adviser, where conversational AI had to sit next to strictly deterministic, auditable advice logic.',
  education: 'BSc Web Design and Development, Edinburgh Napier University',
};

export const links: Link[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/veronikaros' },
  { label: 'GitHub', href: 'https://github.com/rveruna' },
  { label: 'Pluralsight', href: 'https://app.pluralsight.com/profile/verunar' },
];

/** Oldest first: the route reads as a journey from top to bottom. */
export const jobs: Job[] = [
  {
    id: 'com-laude',
    company: 'Com Laude',
    role: 'Frontend Web Developer',
    from: 'Dec 2017',
    to: 'Aug 2020',
    place: 'Edinburgh',
    blurb: 'First stop: user-facing web apps in a Scrum team, and the UI design behind them.',
    highlights: [
      'Built user-facing web apps and components with modern JavaScript frameworks (Vue.js)',
      'Designed the interface and wrote the style guide the whole application followed',
      'Unit tested with Jest; took part in stand-ups, sprint planning and retros',
    ],
    stack: ['Vue.js', 'JavaScript', 'Jest', 'UI design', 'Scrum'],
    color: '#2bd3a0',
  },
  {
    id: 'peoples-energy',
    company: "People's Energy",
    role: 'Web/App Developer',
    from: 'Aug 2020',
    to: 'Sep 2021',
    place: 'Edinburgh · Remote',
    blurb: 'One React Native codebase, shipped to mobile and web.',
    highlights: [
      'Used React Native Web to ship a single codebase to mobile and web',
      'Optimised data retrieval with GraphQL and a strongly typed API schema',
      'Reworked sign-up and registration in React; built accessible HTML5 web apps',
    ],
    stack: ['React Native Web', 'React', 'GraphQL', 'Accessibility'],
    color: '#ffc83d',
  },
  {
    id: 'oak-engage',
    company: 'Oak Engage',
    role: 'Mobile Developer',
    from: 'Oct 2021',
    to: 'May 2023',
    place: 'Newcastle · Remote',
    blurb: 'Core features of an employee-engagement app, from Figma to both app stores.',
    highlights: [
      'Built core app features in React Native, TypeScript and the Redux ecosystem',
      'Turned Figma wireframes and prototypes into components; used native iOS and Android APIs',
      'Shipped production builds to the App Store and Google Play, including CI/CD setup',
    ],
    stack: ['React Native', 'TypeScript', 'Redux', 'Jest', 'Figma', 'CI/CD'],
    color: '#ff5a4e',
  },
  {
    id: 'pets-at-home',
    company: 'Pets at Home',
    role: 'App Developer',
    from: 'Aug 2023',
    to: 'Mar 2024',
    place: 'Remote',
    blurb: 'Features, test pipelines and accessibility in a large retail app.',
    highlights: [
      'Built key mobile features with React Native, TypeScript and Redux Toolkit',
      'Set up the testing pipeline: Jest, Playwright and Testing Library, with linting in CI',
      'Led accessibility work and training; contributed to the i18next localisation setup',
    ],
    stack: ['React Native', 'Redux Toolkit', 'Playwright', 'i18next', 'MSAL'],
    color: '#6b4cff',
  },
  {
    id: 'zonal',
    company: 'Zonal',
    role: 'React Native Developer',
    from: 'Jul 2024',
    to: 'Jul 2025',
    place: 'Edinburgh · Hybrid',
    blurb: 'Testable, performance-minded React Native, plus teaching the team about accessibility.',
    highlights: [
      'Component-driven React Native and TypeScript with Redux Toolkit, tested with Jest and Testing Library',
      'Profiled and tuned rendering and load times with Reactotron and the profiling APIs',
      'Led internal sessions on mobile accessibility; mentored junior developers',
    ],
    stack: ['React Native', 'TypeScript', 'Redux Toolkit', 'Reactotron', 'Mentoring'],
    color: '#2bd3a0',
  },
  {
    id: 'money-means',
    company: 'Money Means',
    role: 'Software Engineer',
    from: 'Jul 2025',
    to: 'Oct 2026',
    place: 'Remote',
    blurb:
      "The UK's first AI-powered digital financial adviser: LLM conversations next to deterministic, FCA-compliant advice logic.",
    highlights: [
      'Built Open Banking account connection and real-time sync across linked and manually tracked data',
      'Bridged LLM extraction with deterministic calculators (debt, pensions, investment risk), with guardrails so AI output never reaches regulated advice paths',
      'Built a Storybook-documented React Native component system with design tokens and accessible financial UI; story coverage enforced in CI',
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'C#/.NET Core', 'Open Banking', 'Storybook', 'MSW'],
    color: '#ffc83d',
  },
];

export const projects: Project[] = [
  {
    id: 'greenest-time',
    name: 'Greenest Time',
    tagline: 'When is the grid cleanest?',
    description:
      'An Expo / React Native app that finds the cleanest window to run the washing machine or charge an EV, from the UK Carbon Intensity forecast. The web build is the same code.',
    highlights: [
      'Sliding-window maths as a tested pure function',
      'Reanimated entrance that respects reduced motion',
      'SVG chart with a written legend, so colour is never the only signal',
    ],
    stack: ['Expo', 'React Native', 'TypeScript', 'Reanimated', 'Vitest'],
    demoUrl: 'https://rveruna.github.io/greenest-time/',
    repoUrl: 'https://github.com/rveruna/greenest-time',
    color: '#2bd3a0',
  },
  {
    id: 'accessible-rn-components',
    name: 'Accessible RN Components',
    tagline: 'Accessibility, checked four ways',
    description:
      'A small React Native component library (Button, TextField, Toggle, Banner). Accessibility is checked by unit tests, contrast tests, an axe audit of every Storybook story, and a mutation check that the tests notice broken rules.',
    highlights: [
      'Every text and background colour pair in the tokens tested against WCAG AA',
      'The browser audit caught three bugs the unit tests missed',
      'Mutation check: 11 of 11 deliberately broken rules caught',
    ],
    stack: ['React Native', 'TypeScript', 'Storybook', 'axe-core', 'Testing Library'],
    demoUrl: 'https://rveruna.github.io/accessible-rn-components/',
    repoUrl: 'https://github.com/rveruna/accessible-rn-components',
    color: '#6b4cff',
  },
  {
    id: 'coauthor-explorer',
    name: 'Co-author Explorer',
    tagline: 'Who writes with whom',
    description:
      'Search for any researcher and see who they write papers with as a live, draggable network, from OpenAlex open data. Expand collaborators, narrow the years, and colour people by groups found automatically.',
    highlights: [
      'Force layout on a canvas, with a keyboard and table alternative',
      'Every choice kept in the URL, so a link reproduces the view',
      'Falls back to saved real data when the API is unavailable, and says so',
    ],
    stack: ['React', 'TypeScript', 'd3-force', 'TanStack Query'],
    demoUrl: 'https://rveruna.github.io/coauthor-explorer/',
    repoUrl: 'https://github.com/rveruna/coauthor-explorer',
    color: '#ffc83d',
  },
  {
    id: 'agile-charge-planner',
    name: 'Agile Charge Planner',
    tagline: 'The cheapest half-hours to charge',
    description:
      'Finds the cheapest time to charge an electric car on the Agile Octopus tariff, from live half-hourly prices for any UK region, and compares the cost with starting now.',
    highlights: [
      'Planner logic as plain, tested functions (125 tests)',
      'API responses validated with Zod',
      'Accessible price chart, with the same prices as a table',
    ],
    stack: ['React', 'TypeScript', 'TanStack Query', 'Zod'],
    demoUrl: 'https://rveruna.github.io/agile-charge-planner/',
    repoUrl: 'https://github.com/rveruna/agile-charge-planner',
    color: '#ff5a4e',
  },
  {
    id: 'bus-trip-info-page',
    name: 'Bus Trip Info',
    tagline: 'Follow real buses, live',
    description:
      "Every bus running on a route you choose, live from Ember's public API: positions on a map, stop times and delays, and a phone view. A bus whose position has stopped updating is listed, not drawn.",
    highlights: [
      'Live map with Leaflet; buses glide between 15-second refreshes',
      'Route kept in the URL, so a link opens the same journey',
      'Lighthouse accessibility, best practices and SEO 100',
    ],
    stack: ['React', 'TypeScript', 'Leaflet', 'Jest'],
    demoUrl: 'https://rveruna.github.io/bus-trip-info-page/',
    repoUrl: 'https://github.com/rveruna/bus-trip-info-page',
    color: '#2bd3a0',
  },
  {
    id: 'motion-showcase',
    name: 'Motion Showcase',
    tagline: 'Four animations, no library',
    description:
      'Spring drag, staggered entrance, SVG path drawing and scroll reveal, built from CSS and about 40 lines of spring physics.',
    highlights: [
      'Damped spring integrated per frame, unit tested',
      'Reduced-motion setting read live',
      'Only opacity and transform animate, so no layout work per frame',
    ],
    stack: ['React', 'TypeScript', 'CSS', 'Vitest'],
    demoUrl: 'https://rveruna.github.io/motion-showcase/',
    repoUrl: 'https://github.com/rveruna/motion-showcase',
    color: '#6b4cff',
  },
  {
    id: 'country-data-table',
    name: 'Country Table',
    tagline: 'Filter, search, share the URL',
    description: 'A responsive data table with filtering, search, pagination and shareable URLs.',
    highlights: [
      'State lives in the URL, so every view is linkable',
      'Lighthouse 100',
      'Responsive down to phone width',
    ],
    stack: ['React', 'TypeScript', 'Jest'],
    demoUrl: 'https://rveruna.github.io/country-data-table/',
    repoUrl: 'https://github.com/rveruna/country-data-table',
    color: '#ffc83d',
  },
  {
    id: 'claude-workflow-kit',
    name: 'Claude Workflow Kit',
    tagline: 'Is this ticket ready?',
    description:
      'Checks a ticket before work starts. A tested linter decides the rules that have a right answer; Claude Code commands handle the judgement calls, and never overrule the linter.',
    highlights: [
      'Exit codes and JSON output, so it drops into CI or a pre-commit hook',
      'Model output never overrides a deterministic rule',
      '41 tests; 12 of 12 deliberate mutations caught',
    ],
    stack: ['TypeScript', 'Node.js', 'Claude Code', 'CLI'],
    repoUrl: 'https://github.com/rveruna/claude-workflow-kit',
    color: '#ff5a4e',
  },
];

export const skillGroups: { title: string; items: string[] }[] = [
  {
    title: 'Mobile & web',
    items: ['React Native', 'Expo', 'React', 'React Native Web', 'TypeScript', 'Vue.js', 'GraphQL'],
  },
  {
    title: 'State & forms',
    items: ['Redux Toolkit', 'Zustand', 'React Hook Form', 'React Navigation', 'MSAL'],
  },
  {
    title: 'Quality',
    items: ['Jest', 'Testing Library', 'MSW', 'Playwright', 'Storybook', 'ESLint', 'Accessibility'],
  },
  { title: 'Also', items: ['C#/.NET Core', 'Open Banking', 'i18next', 'Reactotron', 'CI/CD', 'Mentoring'] },
];
