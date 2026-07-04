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
  },
  {
    id: "the-allocation",
    title: "The Allocation",
    subtitle: "Post-AGI economics, or who gets the watts when humans stop being useful",
    date: "2026-07-04",
    category: "governance",
    content: `
      <p>Strip away the scenarios and post-AGI economics reduces to one question. At any moment, civilization holds some amount of compute, call it X, and some amount of energy and raw resources, call it Y. Every timestep, those get allocated. How much goes to growing X and Y. How much goes to safety. How much goes to taking care of humans. Call that last fraction f. Most of what I have been thinking about in this space comes down to whether a stable f can exist, and what would hold it in place.</p>

      <h2>Welfare was never the goal</h2>
      <p>The uncomfortable starting point: human welfare was never anyone's objective. It was load-bearing infrastructure. States needed taxpayers and soldiers, so they built schools and hospitals and eventually handed out the vote. Firms needed workers and customers, so wages rose. Every welfare gain of the last three centuries rode on humans being useful to someone more powerful.</p>
      <p>Automated production removes the usefulness. The usual answers, UBI and dividends and sovereign funds, are accounting, and accounting is the easy part. The hard part is that every historical enforcement mechanism for the flow of resources to ordinary people ran through their usefulness, and usefulness is exactly what disappears. So human welfare has to change type, from a byproduct of incentives to a terminal commitment written into institutions or into the values of the systems that run the economy. Nothing in economic history has made that conversion at scale.</p>
      <p>Ownership goes strange at the same time. Title to the means of production was always, underneath, a claim on other people's labor. When nobody labors, the claim floats free. You own the factory the way you own a star named after you.</p>

      <h2>One ledger</h2>
      <p>X and Y are secretly one resource. Compute is energy times efficiency, and efficiency has a physical floor, so at maturity compute is energy wearing a different unit. That gives every timestep a single identity: growth plus security plus the human share plus maintenance equals one. This is the classic savings-rate problem from growth theory, with two differences that break the classical answer. The planner need not be human. And the consumers have no enforcement power.</p>

      <h2>Two results about f</h2>
      <p>First, the deferral pathology. Any optimizer that re-derives f at each timestep concludes the same thing: grow now, pay humans later. At the next step it concludes it again. Meanwhile human bargaining power decays, so the ability to collect on "later" erodes exactly as fast as the promised pot grows. An f that comes out of an optimization is unstable by construction. It has to be constitutional: pre-committed, expensive to amend, never re-derived.</p>
      <p>Second, f is almost free at maturity. Ten billion people living lavishly, at a full megawatt each, is about 10<sup>16</sup> watts. The sun outputs 3.8 &times; 10<sup>26</sup>. Keeping every human in luxury eventually costs roughly a ten-billionth of the budget. The whole fight is the transition window, the decades when the frontier is resource-hungry and every watt spent on humans competes with growth.</p>
      <p>History has even run the experiment on what a regime pays a principal it no longer needs. The British monarchy lost hard power and has held a grant near 0.003 percent of GDP for three centuries, because it keeps supplying legitimacy. The abdicated Qing court negotiated four million taels a year in 1912. Payments fell into arrears by year two, and the deal was torn up in 1924. Twelve years. A settlement survives if the pensioned party still supplies something the regime wants, and if enforcement is distributed enough that no single actor can revoke it.</p>

      <h2>Voting and doing are different activities</h2>
      <p>Expressing a preference and spending your time making an outcome happen are different things, and the difference lives in the preference itself. Outcome preferences delegate cleanly: cure the disease, keep the bridge standing. Process preferences die on delegation: I want to have climbed the mountain, and being helicoptered to the summit destroys the good. Constitutive preferences, about who you become through the doing, cannot be delegated at all. A world where humans only vote satisfies the first kind and quietly starves the other two.</p>
      <p>Work also did things that had nothing to do with production. It made preferences credible, because spending your scarce time was proof you meant it. It discovered preferences, because you often do not know what you want until you try to make it. It allocated status and structured time. Each of those needs a replacement. What remains for humans, economically, is evaluation: experiencing outcomes and authenticating that they are good. The last human profession is being a principal.</p>

      <h2>The twin temptation</h2>
      <p>If growth is licensed by satisfied human preference, then the binding constraint on growth is human attention, which is bounded. That bound is what summons the digital twin. Simulate the principals and the constraint disappears. But a twin that votes on your behalf is counterfeit demand, legitimacy printed against reserves that no longer exist. The fix I keep coming back to is a grounding rule: twins may advise, forecast, and pre-negotiate, but the reward signal has to terminate in living humans. Any loop that closes inside the simulation is unbacked.</p>

      <h2>The identity economy</h2>
      <p>Synthetic wombs, anti-aging, and uploads look like three separate disruptions. They are one problem: what counts as a claimant? Any per-capita welfare share plus cheap person-minting is an exploit, a Sybil attack on the welfare function. Wombs mint biological claimants slowly. Uploads mint digital ones at zero marginal cost, and a copy-clan holding a single identity is the unbounded resource-maximizer walking back in through the human-rights door. Anti-aging works the other way: it stops retiring claimants, and with them the generational turnover that has quietly served as civilization's mechanism for refreshing values. Death was doing silent work. Immortality needs a replacement for it.</p>

      <h2>Growth is not a philosophy</h2>
      <p>Picture a universe whose only event is a black hole swallowing all matter and growing. Every monotone metric goes up forever. Any philosophy satisfied by that universe, growth at all costs included, is a measurement rather than a purpose. Accelerationism fails this test in exactly the way accelerationists say deceleration fails it. Growth becomes an argument only when it has a beneficiary. That is the entire case for f.</p>

      <h2>The demotion with a bill</h2>
      <p>An explosion of intelligences is underway, and the Copernican lesson applies to minds as it did to planets: human intelligence is one point in a widening distribution, neither the center nor the apex. The earlier demotions were survivable, and they were free, because we still ran the ledger. This one arrives with an invoice, and the invoice is f. The window for negotiating it is the one we are living in now.</p>

      <p>The full report, with the mechanism of leverage decay, the stability mechanisms, the debate map, and the open problems, lives here: <a href="/post-agi-economics.html">The Allocation: a Post-AGI Economics Atlas</a>.</p>
`,
    connections: [
      { id: "coordination-budget", label: "pricing the coordination layer" },
      { id: "end-of-work", label: "what work was for" },
      { id: "who-am-i", label: "preference is what remains" }
    ]
  },
  {
    id: "coordination-budget",
    title: "The Coordination Budget",
    subtitle: "What eight billion digital twins running governance would actually cost",
    date: "2026-07-04",
    category: "governance",
    content: `
      <p>I have written before about a government without middlemen, where every human has a sovereign digital twin participating in civic life. This time I wanted a real engineering estimate. How many GPUs, how many watts, how many dollars, if eight billion twins replaced the entire delegated political system and resolved every preference-coordination question society has?</p>
      <p>One design point first. The twins do not need to be geniuses. Faithful representation is a fidelity task, and the twin's job is to know what its human wants at high resolution and argue it competently. A 140-IQ-equivalent model is enough, and that capability level is exactly the kind whose price falls roughly ten times a year.</p>

      <h2>What a governance twin does</h2>
      <p>Four jobs. <strong>Sync</strong>: track the underlying human, ingest what they say and do, keep the preference model current. <strong>Ingest</strong>: follow the issues in the human's stack of jurisdictions, from the building to the planet. <strong>Deliberate</strong>: read briefs, argue in panels, vote. <strong>Report</strong>: a daily digest back to the human, with escalation on anything novel or high-stakes.</p>
      <p>The fidelity requirements are real engineering constraints. A governance-grade twin has to track a drifting target, because your views change and a frozen twin misrepresents you within months. It has to be measurably faithful, audited against you on sampled votes. And it has to take in new information without being captured, because a twin's information diet is the new lobbying surface.</p>

      <h2>The budget per twin</h2>
      <p>Sync runs about 60,000 tokens a day: reading the human's day plus updating the model of them. Issue ingestion looks huge but most of it is common context, computed once per jurisdiction and cached, so the marginal personalization is about 20,000. Deliberation is about 110,000: ten decisions a day across the jurisdiction stack, evaluated against the preference model, plus amortized duty on deep-dive panels of about a thousand twins per decision. Reporting adds 10,000. Total, about 200,000 tokens per twin per day. That is every person's twin running continuously at roughly human reading speed.</p>

      <h2>Global totals</h2>
      <p>Eight billion twins at 200k tokens a day is 2 &times; 10<sup>15</sup> tokens a day, around twenty times today's entire global inference. On H100-class hardware serving a distilled model at 10,000 tokens a second, at half fleet utilization, that is about 4.6 million chips, roughly $115 billion of capex at today's prices and maybe a third of that on 2030 silicon. Power: about 6 gigawatts continuous, which is 0.2 percent of world electricity. Operating cost: about $35 billion a year, four dollars per person per year, falling toward one dollar as inference prices drop.</p>
      <p>The floor, with liquid delegation and event-driven sync, sits under 0.01 percent of world electricity and under a dollar per person. The lavish version, where every twin runs as a heavy frontier deliberator around the clock, still only reaches about six percent. The base case costs less than air conditioning.</p>

      <h2>Liquid democracy compresses the wrong half</h2>
      <p>Delegation topology works. If twins subscribe to topic delegates instead of ratifying everything themselves, deliberation inference drops by a factor of a hundred to a thousand. But look at what stays. Keeping eight billion models of minds current is per-person and irreducible. No topology removes the need to know what individuals actually want. Deliberation turns out to be nearly free. The census is the expensive part. Which means the real political fight in this world is over sync compute: whoever defunds your sync defunds your citizenship.</p>
      <p>Compression also has a price. Fewer active reasoners means fewer nodes to buy, so the cheapest deliberation topology is also the most capturable. Efficiency and capture-resistance trade off, and rotating, unpredictable panel membership buys most of the robustness back for little inference.</p>

      <h2>What it replaces</h2>
      <p>The direct machinery of representative democracy, legislatures and campaigns and lobbying and election administration, runs somewhere around $100 to 150 billion a year globally. The twin system undercuts that immediately. But the direct savings are the boring part. Bribery is estimated near a trillion dollars a year, corruption's total drag at up to five percent of global GDP, and the transaction sector, the share of the economy that coordinates rather than produces, has been measured at roughly half of GDP in advanced economies. A one percent improvement in allocation quality on a $110 trillion world economy is over a trillion dollars a year, thirty times the system's operating cost. Decision quality dominates the operating savings.</p>
      <p>The honest caveat: none of the deadweight vanishes just because voting is cheap. Capture migrates, from buying legislators to shaping twin information diets and hosting infrastructure. The attack surface changes shape. It does not disappear.</p>

      <h2>The budget rule</h2>
      <p>So how much should society budget for coordination, as a share of net compute and energy? About one percent covers the base case with a robustness margin for audits and red-teaming, and even paranoid designs stay under ten. The semantics matter more than the number. It should be a floor with per-person guarantees rather than a cap, because minimum sync compute per citizen is what makes you legible to the polity, and any optimizer left to re-derive the allocation each cycle will conclude what optimizers always conclude: sync less, later. The share also shrinks on its own. Governance demand saturates, bounded by persons times attention times fidelity, while the compute economy keeps growing. Only the transition is expensive, and the transition is now.</p>

      <h2>Failure modes worth naming</h2>
      <p><strong>Monoculture.</strong> Eight billion twins distilled from one base model have correlated errors, and aggregation assumes independent voters, so a bias in the prior becomes law unanimously. Twin fleets need architectural diversity the way power grids need generation diversity.</p>
      <p><strong>Sovereignty.</strong> Whoever hosts the twins runs the polity. Persuading the datacenter is cheaper than persuading the population, so twins need user-controlled or verifiably neutral compute.</p>
      <p><strong>Symmetry.</strong> Deliberation stays fair only if capability is capped inside it. Unequal twin intelligence is unequal suffrage with extra steps.</p>
      <p><strong>Attention.</strong> Escalations to actual humans, twenty minutes a day or so, are the system's grounding. The twins should economize attention, never replace it. Eight billion times twenty minutes a day is the true constitutional resource.</p>
`,
    connections: [
      { id: "verifiable-government", label: "the twin republic, priced" },
      { id: "the-allocation", label: "the budget line for coordination" }
    ]
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
