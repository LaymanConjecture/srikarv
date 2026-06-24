// ============================================
// Blog Knowledge Graph — Posts & Connections
// ============================================
// PUBLIC branch: the public site shows a single post for now.
// The full archive lives on the `private` branch — push there first,
// then promote posts here when they're ready to be public.

const POSTS = [
  {
    id: "who-am-i",
    title: "Who Am I",
    subtitle: "An introduction — more to come",
    date: "2026-06-24",
    category: "personal",
    content: `
      <p>This is the beginning of a longer answer. I'll be writing into this space over time — who I am, what I'm building, and the ideas I keep circling back to.</p>
      <p>For now, a placeholder. More soon.</p>
    `,
    connections: []
  }
];

const CATEGORY_COLORS = {
  governance:   { fill: "#e8eef3", stroke: "#5b7f9b" },  // slate blue — how we organize
  epistemics:   { fill: "#f0eaf0", stroke: "#8b6b8b" },  // mauve — how we think
  critique:     { fill: "#f7efde", stroke: "#b8860b" },  // gold — what's wrong now
  technology:   { fill: "#e6f0f0", stroke: "#5b8b8b" },  // teal — built things
  philosophy:   { fill: "#f0eaf0", stroke: "#8b6b8b" },  // mauve (alias)
  culture:      { fill: "#f5ebe9", stroke: "#b87878" },  // clay — culture
  science:      { fill: "#ebf0e6", stroke: "#6b8e6b" },  // sage — how it works
  personal:     { fill: "#f3ece6", stroke: "#a07050" }   // terracotta — who I am
};
