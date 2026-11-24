/**
 * Mock Data Store for FinNews AI
 * Includes Indian & Global market equities: HDFC Bank, Reliance Industries, Tesla, and Tata Motors.
 * Contains multiple historical runs, evolution diffs, memory trails, and notes.
 */

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

let mockWatchlist = [
  {
    id: 'wl-hdfc',
    name: 'HDFC Bank',
    ticker: 'HDFCBANK.NS',
    created_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 'wl-reliance',
    name: 'Reliance Industries',
    ticker: 'RELIANCE.NS',
    created_at: '2026-10-18T10:30:00Z',
  },
  {
    id: 'wl-tesla',
    name: 'Tesla, Inc.',
    ticker: 'TSLA',
    created_at: '2026-10-20T14:15:00Z',
  },
  {
    id: 'wl-tatamotors',
    name: 'Tata Motors',
    ticker: 'TATAMOTORS.NS',
    created_at: '2026-11-01T11:00:00Z',
  },
];

let mockAnalyses = {
  'wl-hdfc': [
    {
      id: 'an-hdfc-3',
      watchlist_id: 'wl-hdfc',
      headline: 'HDFC Bank Q3: Deposit Inflow Surges 16.5% YoY as Retail CD Ratio Eases Below 100%',
      summary:
        'HDFC Bank reported accelerated retail deposit mobilization in its latest quarterly update, narrowing the post-merger credit-to-deposit gap. Net interest margins stabilized at 3.44% following targeted cost of funds optimization, while gross NPAs held firm at 1.24%. The system successfully connected this quarter’s commentary with prior management guidance on branch addition targets.',
      key_events: [
        {
          title: 'Credit-Deposit ratio drops from 104% to 99.2%',
          detail:
            'Aggressive institutional and NRI deposit drives helped rebalance the liability profile ahead of RBI liquidity coverage ratio compliance deadlines.',
          source_url: 'https://www.livemint.com/market/hdfc-bank-deposit-growth-q3-fy26',
        },
        {
          title: 'Tier-1 Capital Adequacy rises to 17.1%',
          detail:
            'Internal capital generation remained resilient despite elevated integration IT spend and subsidiary write-offs.',
          source_url: 'https://economictimes.indiatimes.com/markets/stocks/hdfc-bank-capital-ratios',
        },
        {
          title: 'RBI finalizes stricter project finance draft norms',
          detail:
            'Impact on HDFC Bank estimated at <15 bps on CET1, well within analyst tolerance bounds.',
          source_url: 'https://www.bloomberg.com/news/rbi-bank-regulations-infra-loans',
        },
      ],
      entities: ['HDFC Bank', 'RBI', 'Sashidhar Jagdishan', 'HDFC Ltd', 'NII'],
      sentiment: 'positive',
      risk_level: 'low',
      what_changed:
        'Compared to the Nov 15 analysis: Deposit mobilization shifted from a primary vulnerability to a core operational strength (+180 bps growth differential). The CD ratio has finally normalized below 100% as flagged in analyst notes. Net Interest Margin (NIM) degradation appears to have bottomed out.',
      recurring_themes: [
        {
          theme: 'Liability Franchise Re-anchoring',
          note: 'Consistently the central focus across all 3 quarterly reviews since the mega-merger.',
        },
        {
          theme: 'RBI Regulatory Buffer Preparedness',
          note: 'Proactive provisioning cushion maintained against unsecured retail portfolio.',
        },
      ],
      sources: [
        {
          title: 'LiveMint: HDFC Bank Q3 Operational Update & Balance Sheet Metrics',
          url: 'https://www.livemint.com/market/hdfc-bank-deposit-growth-q3-fy26',
        },
        {
          title: 'Economic Times: Banking Sector NIM Trends and CD Ratio Analysis',
          url: 'https://economictimes.indiatimes.com/markets/stocks/hdfc-bank-capital-ratios',
        },
        {
          title: 'Bloomberg: Reserve Bank of India Framework for High-Value Project Financing',
          url: 'https://www.bloomberg.com/news/rbi-bank-regulations-infra-loans',
        },
      ],
      memory_used: [
        'Analyst Note (Nov 10): "Watch out for deposit growth trajectory; need >15% to defend NIM"',
        'Previous Run (Nov 15): Flagged CD ratio at 104% as medium-high leverage risk',
        'System Memory: Tracked 1,200 branch rollout commitment made during FY25 investor conference',
      ],
      created_at: '2026-11-24T18:30:00Z',
    },
    {
      id: 'an-hdfc-2',
      watchlist_id: 'wl-hdfc',
      headline: 'HDFC Bank Margin Compression Lingers; Elevated CD Ratio Prompts Retail Deposit Push',
      summary:
        'HDFC Bank experienced persistent margin contraction as high-cost legacy borrowings from HDFC Ltd continue to mature slowly. Management reiterated guidance to prioritize deposit gathering over aggressive loan book expansion for the next 4 quarters.',
      key_events: [
        {
          title: 'Net Interest Margin compresses 6 bps QoQ to 3.40%',
          detail:
            'Higher competition for retail deposits across PSU and private peers elevated blended cost of funds.',
          source_url: 'https://www.reuters.com/business/finance/hdfc-bank-margins-fy26',
        },
        {
          title: 'Branch network expands by 240 outlets in Q2',
          detail:
            'Strategic rollout focused primarily in suburban Maharashtra, Gujarat, and South India to capture CASA.',
          source_url: 'https://www.business-standard.com/companies/news/hdfc-branch-expansion',
        },
      ],
      entities: ['HDFC Bank', 'Sashidhar Jagdishan', 'CASA Ratio'],
      sentiment: 'neutral',
      risk_level: 'medium',
      what_changed:
        'Compared to Nov 02 analysis: Credit growth moderated intentionally from 14% to 11.5% as management prioritized liquidity coverage. Operational expenditures remained slightly higher than forecast due to branch opening costs.',
      recurring_themes: [
        {
          theme: 'Liability Franchise Re-anchoring',
          note: 'Cost of deposits remain elevated amid tight interbank liquidity.',
        },
        {
          theme: 'Tech Platform Upgrades',
          note: 'Core banking redundancy milestones achieved with zero RBI downtime infractions.',
        },
      ],
      sources: [
        {
          title: 'Reuters: India HDFC Bank navigates post-merger balance sheet re-alignment',
          url: 'https://www.reuters.com/business/finance/hdfc-bank-margins-fy26',
        },
        {
          title: 'Business Standard: Retail banking branch network velocity',
          url: 'https://www.business-standard.com/companies/news/hdfc-branch-expansion',
        },
      ],
      memory_used: [
        'Previous Run (Nov 02): Identified deposit pricing war among top 4 private lenders',
        'Analyst Note (Oct 28): "Branch productivity ramp up usually requires 18-24 months"',
      ],
      created_at: '2026-11-15T11:20:00Z',
    },
    {
      id: 'an-hdfc-1',
      watchlist_id: 'wl-hdfc',
      headline: 'Post-Merger Integration Review: HDFC Bank Balances Wholesale Growth with Capital Buffers',
      summary:
        'Initial baseline scan following the parent mortgage merger. Credit demand across corporate and mortgage verticals remains robust, but market scrutiny on return on assets (RoA) and CASA dilution dominates institutional investor sentiment.',
      key_events: [
        {
          title: 'Mortgage loan disbursement velocity increases 18%',
          detail:
            'Cross-selling banking accounts to legacy mortgage customers showed early 12% penetration.',
          source_url: 'https://www.moneycontrol.com/news/business/hdfc-bank-mortgage-cross-sell',
        },
        {
          title: 'RBI maintains strict oversight on liquidity coverage ratios',
          detail:
            'Banks mandated to hold higher sovereign paper buffers against retail digital deposits.',
          source_url: 'https://www.rbi.org.in/notifications/lcr-buffer-2026',
        },
      ],
      entities: ['HDFC Bank', 'RBI', 'HDFC ERGO', 'HDFC Life'],
      sentiment: 'neutral',
      risk_level: 'medium',
      what_changed:
        'Initial baseline analysis for HDFC Bank watchlist entity. Established core tracking metrics on NIM (3.46%), CD ratio (106%), and CASA ratio (37.2%).',
      recurring_themes: [
        {
          theme: 'Liability Franchise Re-anchoring',
          note: 'Baseline entry: Need to replace wholesale parent debt with low-cost retail deposits.',
        },
      ],
      sources: [
        {
          title: 'Moneycontrol: HDFC Bank post-merger synergy review and pipeline',
          url: 'https://www.moneycontrol.com/news/business/hdfc-bank-mortgage-cross-sell',
        },
      ],
      memory_used: [
        'System Initialization: Baseline profile created with quarterly earnings reports and regulatory filings.',
      ],
      created_at: '2026-11-02T08:15:00Z',
    },
  ],

  'wl-reliance': [
    {
      id: 'an-reliance-2',
      watchlist_id: 'wl-reliance',
      headline: 'Reliance Retail & Jio Drive EBITDA Expansion; Green Energy Gigafactory Enters Pilot Phase',
      summary:
        'Reliance Industries reported consolidated double-digit operating profit expansion led by telecom tariff monetization and grocery retail footprint efficiency. The Jamnagar Dhirubhai Ambani Green Energy complex commenced pilot production for solar PV cells.',
      key_events: [
        {
          title: 'Jio ARPU climbs to ₹208 following full tariff pass-through',
          detail:
            '5G fixed-wireless AirFiber additions exceeded 1.2 million subscribers in the quarter.',
          source_url: 'https://www.reuters.com/technology/reliance-jio-q3-earnings-5g',
        },
        {
          title: 'Solar PV Gigafactory pilot testing inaugurated in Gujarat',
          detail:
            'First phase 10 GW heterojunction technology modules validated for commercial commercialization.',
          source_url: 'https://www.livemint.com/industry/energy/reliance-green-energy-jamnagar',
        },
      ],
      entities: ['Reliance Industries', 'Mukesh Ambani', 'Jio Platforms', 'Reliance Retail'],
      sentiment: 'positive',
      risk_level: 'low',
      what_changed:
        'Compared to Nov 10 run: Green energy capital expenditure timeline confirmed on schedule with no overrun. O2C refining margins rebounded by $1.8/bbl amidst Asian middle distillate tightness.',
      recurring_themes: [
        {
          theme: 'New Energy Transformation',
          note: 'Decoupling long-term enterprise valuation from fossil fuel crack spreads.',
        },
        {
          theme: 'Consumer Business De-merger Speculation',
          note: 'Street consensus anticipating Jio and Retail IPO roadmaps by late 2027.',
        },
      ],
      sources: [
        {
          title: 'Reuters: Jio ARPU expansion and broadband market share metrics',
          url: 'https://www.reuters.com/technology/reliance-jio-q3-earnings-5g',
        },
        {
          title: 'LiveMint: Reliance Green Energy Jamnagar milestone review',
          url: 'https://www.livemint.com/industry/energy/reliance-green-energy-jamnagar',
        },
      ],
      memory_used: [
        'Previous Run (Nov 10): Flagged O2C refining spread volatility as short-term drag',
        'Analyst Note: "Watch execution speed on 10GW solar cell manufacturing module"',
      ],
      created_at: '2026-11-22T14:45:00Z',
    },
    {
      id: 'an-reliance-1',
      watchlist_id: 'wl-reliance',
      headline: 'O2C Margin Softness Offset by Digital Services as RIL Sustains Heavy CapEx',
      summary:
        'Volatile crude refining cracks weighed on downstream petrochemical earnings, but Jio subscription gains and retail store expansion supported overall consolidated cash flows.',
      key_events: [
        {
          title: 'Petrochem margins dip 8% on global overcapacity',
          detail:
            'Chinese export volumes suppressed regional polymer and polyester margins.',
          source_url: 'https://economictimes.indiatimes.com/industry/ril-o2c-margins',
        },
      ],
      entities: ['Reliance Industries', 'O2C', 'Jio'],
      sentiment: 'neutral',
      risk_level: 'medium',
      what_changed: 'Baseline scan for Reliance Industries.',
      recurring_themes: [
        {
          theme: 'New Energy Transformation',
          note: 'Long horizon capex commitment.',
        },
      ],
      sources: [
        {
          title: 'Economic Times: RIL O2C Margins and Downstream Trends',
          url: 'https://economictimes.indiatimes.com/industry/ril-o2c-margins',
        },
      ],
      memory_used: ['System Initialization: Annual report and quarterly conference call filings.'],
      created_at: '2026-11-10T10:00:00Z',
    },
  ],

  'wl-tesla': [
    {
      id: 'an-tesla-2',
      watchlist_id: 'wl-tesla',
      headline: 'Tesla Energy Storage Margin Hits Record 31%; Full Self-Driving V13 Deploys to Fleet',
      summary:
        'Tesla’s Q3 update demonstrated that utility-scale Megapack deployments have grown into the company’s highest margin division. Automotive gross margins ex-regulatory credits stabilized at 17.2%, while the FSD V13 rollout demonstrated a 3x reduction in driver interventions.',
      key_events: [
        {
          title: 'Megapack quarterly deployments reach 6.9 GWh',
          detail:
            'Lathrop and Shanghai Megafactories operating near rated capacity with 18-month contracted backlogs.',
          source_url: 'https://www.bloomberg.com/news/tesla-energy-megapack-margins',
        },
        {
          title: 'FSD V13 neural net architecture deployment begins',
          detail:
            'End-to-end vision model integrates parking, highway, and complex city navigation into single model.',
          source_url: 'https://www.theverge.com/transportation/tesla-fsd-v13-release-notes',
        },
      ],
      entities: ['Tesla', 'Elon Musk', 'FSD V13', 'Megapack', 'Shanghai Megafactory'],
      sentiment: 'positive',
      risk_level: 'medium',
      what_changed:
        'Compared to Oct 25 analysis: Energy division gross profit rose 45% QoQ, proving it as an effective buffer against EV price cuts. Autonomous regulatory approval timelines in California and Texas showed tangible pilot traction.',
      recurring_themes: [
        {
          theme: 'Energy as Profit Driver',
          note: 'Storage business margin profile now comfortably exceeding automotive hardware margins.',
        },
        {
          theme: 'Regulatory Scrutiny on Unsupervised Autonomy',
          note: 'NHTSA inquiries remain active regarding low-visibility incident telemetry.',
        },
      ],
      sources: [
        {
          title: 'Bloomberg: Tesla Energy Storage emerges as primary gross margin contributor',
          url: 'https://www.bloomberg.com/news/tesla-energy-megapack-margins',
        },
        {
          title: 'The Verge: FSD V13 technical breakdown and driver intervention rates',
          url: 'https://www.theverge.com/transportation/tesla-fsd-v13-release-notes',
        },
      ],
      memory_used: [
        'Previous Run (Oct 25): Noted investor skepticism on auto gross margin trajectory',
        'Analyst Note (Nov 03): "Energy storage backlog is the key valuation catalyst for H2"',
        'System Memory: Correlated Cybertruck production ramp with 4680 cell yield improvements',
      ],
      created_at: '2026-11-20T16:00:00Z',
    },
    {
      id: 'an-tesla-1',
      watchlist_id: 'wl-tesla',
      headline: 'Auto Margin Compression Eases as Global EV Delivery Targets Hold Steady',
      summary:
        'Promotional financing in China and North America boosted volume deliveries while gross margins held resilient above 16.5%.',
      key_events: [
        {
          title: 'Model Y refresh tooling underway in Berlin and Austin',
          detail: 'Structural battery pack refinements expected to reduce unit BOM by $1,400.',
          source_url: 'https://www.reuters.com/business/autos/tesla-model-y-juniper-production',
        },
      ],
      entities: ['Tesla', 'Gigafactory Berlin', 'Gigafactory Texas'],
      sentiment: 'neutral',
      risk_level: 'medium',
      what_changed: 'Baseline analysis for Tesla watchlist tracking.',
      recurring_themes: [
        {
          theme: 'Hardware Price Elasticity',
          note: 'Financing incentives substituting for direct MSRP price slashing.',
        },
      ],
      sources: [
        {
          title: 'Reuters: Tesla Model Y production lines and global delivery volume',
          url: 'https://www.reuters.com/business/autos/tesla-model-y-juniper-production',
        },
      ],
      memory_used: ['System Initialization: SEC 10-Q filings and investor deck.'],
      created_at: '2026-10-25T13:30:00Z',
    },
  ],

  'wl-tatamotors': [
    {
      id: 'an-tatamotors-1',
      watchlist_id: 'wl-tatamotors',
      headline: 'Tata Motors Advances Demerger Plan; JLR Order Book Remains at £3.8B with Defender Lead',
      summary:
        'Tata Motors’ board approved the structured legal separation of its Commercial Vehicles (CV) and Passenger Vehicles (PV/EV) entities. Jaguar Land Rover free cash flow generation hit quarterly records, though UK supplier supply chain bottlenecks remain an operational focus.',
      key_events: [
        {
          title: 'NCLT process initiated for dual company demerger',
          detail:
            'Demerger expected to unlock focused capital allocation for electric mobility and commercial trucks separately.',
          source_url: 'https://www.bseindia.com/corporates/tata-motors-demerger-update',
        },
        {
          title: 'JLR Range Rover Electric waitlist crosses 48,000 reservations',
          detail: 'Thermal testing in Dubai and Arctic proving grounds confirmed 800V charging efficiency.',
          source_url: 'https://www.autocar.co.uk/car-news/new-cars/range-rover-electric-specs',
        },
      ],
      entities: ['Tata Motors', 'JLR', 'NCLT', 'Range Rover Electric', 'Tata Passenger Electric Mobility'],
      sentiment: 'positive',
      risk_level: 'low',
      what_changed:
        'Baseline scan: Demerger timeline affirmed for completion by mid-2027. JLR net debt lowered to under £400 million.',
      recurring_themes: [
        {
          theme: 'Value Unlocking via Corporate Demerger',
          note: 'Allows separate valuation benchmarks against global commercial vs luxury automotive peers.',
        },
      ],
      sources: [
        {
          title: 'BSE India: Corporate filing on Scheme of Arrangement & Share Entitlement',
          url: 'https://www.bseindia.com/corporates/tata-motors-demerger-update',
        },
        {
          title: 'Autocar: Jaguar Land Rover luxury electric roadmap',
          url: 'https://www.autocar.co.uk/car-news/new-cars/range-rover-electric-specs',
        },
      ],
      memory_used: [
        'System Initialization: Established tracking for India EV market share (71%) and JLR FCF trajectory.',
      ],
      created_at: '2026-11-18T09:30:00Z',
    },
  ],
};

let mockNotes = {
  'wl-hdfc': [
    {
      id: 'note-hdfc-1',
      watchlist_id: 'wl-hdfc',
      note: 'Need to track deposit beta in upcoming Q3 analyst call. Watch whether retail term deposits outpace low-cost CASA growth.',
      created_at: '2026-11-10T08:30:00Z',
    },
    {
      id: 'note-hdfc-2',
      watchlist_id: 'wl-hdfc',
      note: 'RBI proposal on 5% provisioning for under-construction infra loans seems manageable for HDFC Bank balance sheet due to conservative underwriting.',
      created_at: '2026-11-16T14:20:00Z',
    },
    {
      id: 'note-hdfc-3',
      watchlist_id: 'wl-hdfc',
      note: 'Branch productivity ramp-up: Sashidhar mentioned in meeting that branches opened in 2024 are now hitting EBITDA breakeven.',
      created_at: '2026-11-23T10:05:00Z',
    },
  ],
  'wl-reliance': [
    {
      id: 'note-reliance-1',
      watchlist_id: 'wl-reliance',
      note: 'Watch execution speed on the 10GW solar cell manufacturing module in Jamnagar. Crucial for ESG institutional re-rating.',
      created_at: '2026-11-12T11:00:00Z',
    },
  ],
  'wl-tesla': [
    {
      id: 'note-tesla-1',
      watchlist_id: 'wl-tesla',
      note: 'Energy storage backlog is the key valuation catalyst for H2. Gross margins in Megapack are outpacing automotive hardware.',
      created_at: '2026-11-03T16:45:00Z',
    },
  ],
  'wl-tatamotors': [
    {
      id: 'note-tatamotors-1',
      watchlist_id: 'wl-tatamotors',
      note: 'Monitor JLR net debt elimination timeline. Management guided zero net debt by FY26 end.',
      created_at: '2026-11-19T07:15:00Z',
    },
  ],
};

let mockMemory = {
  'wl-hdfc': {
    items: [
      'Prior note on Q2 deposit mobilization lag (analyst note from Oct 24)',
      'Previous analysis highlighted branch expansion target of 1,000 branches for FY25',
      'Persistent RBI regulatory scrutiny regarding LCR buffers and unsecured loan underwriting',
      'Cross-sell penetration metric of mortgage customer base into liability franchise tracked at 12%',
      'Analyst hypothesis: Net Interest Margin inflection point expected around Q3 FY26',
    ],
  },
  'wl-reliance': {
    items: [
      'Tracked O2C refining spread correlation with Singapore gross refining margins (GRM)',
      'Analyst note on Jamnagar 10GW solar giga-factory pilot commissioning schedule',
      'Historical trajectory of Jio ARPU progression post telecom tariff adjustments',
      'Retail square footage footprint expansion and store-level EBITDA margins',
    ],
  },
  'wl-tesla': {
    items: [
      'Correlated Cybertruck volume ramp with dry-cathode 4680 cell yield improvements',
      'Analyst priority: Megapack utility storage contract backlog and gross margin expansion',
      'NHTSA regulatory investigation tracking on Full Self-Driving intervention metrics',
      'China automotive price war elasticity vs zero-down financing programs',
    ],
  },
  'wl-tatamotors': {
    items: [
      'Dual entity NCLT legal demerger roadmap for Commercial Vehicles vs PV/EV',
      'JLR order book composition with luxury margin contribution from Defender and Range Rover',
      'India domestic EV market share dynamics against new entrants and subsidy phase-outs',
    ],
  },
};

// Mock API implementations
export const mockApi = {
  async getHealth() {
    await delay(150);
    return { status: 'ok', mock: true, timestamp: new Date().toISOString() };
  },

  async getWatchlist() {
    await delay(250);
    return [...mockWatchlist];
  },

  async addWatchlistItem({ name, ticker }) {
    await delay(350);
    if (!name || !name.trim()) {
      throw new Error('Company name is required');
    }
    const newId = `wl-${Date.now()}`;
    const newItem = {
      id: newId,
      name: name.trim(),
      ticker: ticker ? ticker.trim().toUpperCase() : '',
      created_at: new Date().toISOString(),
    };
    mockWatchlist.push(newItem);
    mockAnalyses[newId] = [];
    mockNotes[newId] = [];
    mockMemory[newId] = {
      items: [
        `Initialized tracking for ${newItem.name} (${newItem.ticker || 'No Ticker'})`,
        'Awaiting initial web scrape & sentiment baseline',
      ],
    };
    return newItem;
  },

  async deleteWatchlistItem(id) {
    await delay(250);
    const index = mockWatchlist.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      throw new Error(`Watchlist item with id ${id} not found`);
    }
    mockWatchlist.splice(index, 1);
    delete mockAnalyses[id];
    delete mockNotes[id];
    delete mockMemory[id];
    return { success: true };
  },

  async getAnalyses(watchlistId) {
    await delay(250);
    const list = mockAnalyses[watchlistId] || [];
    return [...list];
  },

  async getAnalysis(id) {
    await delay(200);
    for (const analyses of Object.values(mockAnalyses)) {
      const match = analyses.find((a) => String(a.id) === String(id));
      if (match) return { ...match };
    }
    throw new Error(`Analysis with id ${id} not found`);
  },

  async triggerAnalysis({ watchlist_id, max_articles = 10 }) {
    // Simulate real analysis generation with staged progress (4.8s delay in mock mode)
    await delay(4800);

    const company = mockWatchlist.find((item) => String(item.id) === String(watchlist_id));
    if (!company) {
      throw new Error(`Company with id ${watchlist_id} not found in watchlist`);
    }

    const previousList = mockAnalyses[watchlist_id] || [];
    const previous = previousList[0];
    const notesCount = (mockNotes[watchlist_id] || []).length;
    const memoryCount = (mockMemory[watchlist_id]?.items || []).length;

    const analysisId = `an-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const sampleSentiments = ['positive', 'positive', 'neutral', 'negative'];
    const sampleRisks = ['low', 'medium', 'medium', 'high'];
    const randomSentiment = sampleSentiments[Math.floor(Math.random() * sampleSentiments.length)];
    const randomRisk = sampleRisks[Math.floor(Math.random() * sampleRisks.length)];

    const newAnalysis = {
      id: analysisId,
      watchlist_id: String(watchlist_id),
      headline: `${company.name} Intelligence Update: Market Signals Point to Solid Operational Momentum & Evolving Catalysts`,
      summary: `Automated news intelligence synthesized fresh reports for ${company.name} (${company.ticker || 'N/A'}). Cross-referenced findings with ${memoryCount} retained memories and ${notesCount} analyst notes. Recent operational indicators show resilient channel demand while capital allocation remains calibrated to macroeconomic headwinds.`,
      key_events: [
        {
          title: `${company.name} expands institutional outreach and operational footprint`,
          detail: `Recent business wire releases highlight new commercial partnerships, strategic capacity additions, and regulatory compliance milestones achieved in the current operating cycle.`,
          source_url: 'https://www.bloomberg.com/markets',
        },
        {
          title: 'Quarterly financial metrics reflect resilient unit economics',
          detail: `Underlying cash flow generation remained robust. Working capital efficiency improved by approximately 3.2% based on latest disclosures.`,
          source_url: 'https://www.reuters.com/business',
        },
        {
          title: 'Macro and regulatory environment remains supportive yet disciplined',
          detail: `Sector regulators released updated supervisory standards; initial compliance audit suggests zero structural headwinds for tier-1 operators.`,
          source_url: 'https://economictimes.indiatimes.com',
        },
      ],
      entities: [company.name, company.ticker || 'Ticker', 'Market Intelligence', 'Q3 Outlook', 'Regulatory Body'],
      sentiment: randomSentiment,
      risk_level: randomRisk,
      what_changed: previous
        ? `Since the previous analysis on ${new Date(previous.created_at).toLocaleDateString()}: Sentiment moved to ${randomSentiment}. Incorporated recent analyst notes regarding capital structure and supply dynamics. Operational indicators reflect progressive de-risking compared to the prior run.`
        : `Initial synthesized intelligence baseline established for ${company.name}. Stored foundational corporate entity records, key executives, and regulatory disclosures into active working memory.`,
      recurring_themes: [
        {
          theme: 'Operating Leverage & Margin Defensibility',
          note: `Consistently monitored theme across current and historical analysis cycles for ${company.name}.`,
        },
        {
          theme: 'Regulatory & Governance Adherence',
          note: 'Proactive compliance posture reduces litigation and policy disruption overhang.',
        },
      ],
      sources: [
        {
          title: `Bloomberg Markets: Real-time intelligence report for ${company.name}`,
          url: 'https://www.bloomberg.com/markets',
        },
        {
          title: `Reuters Business: Sector updates and corporate governance analysis`,
          url: 'https://www.reuters.com/business',
        },
        {
          title: `Economic Times: Industry financial indicators and executive commentary`,
          url: 'https://economictimes.indiatimes.com',
        },
      ],
      memory_used: [
        ...(mockMemory[watchlist_id]?.items?.slice(0, 3) || []),
        notesCount > 0 ? `Analyst Note: Integrated latest note regarding strategic priorities` : `Baseline sector profile for ${company.name}`,
        `Synthesized ${max_articles} scraped articles across global financial feeds`,
      ],
      created_at: timestamp,
    };

    // Prepend to analyses list
    if (!mockAnalyses[watchlist_id]) {
      mockAnalyses[watchlist_id] = [];
    }
    mockAnalyses[watchlist_id].unshift(newAnalysis);

    // Update memory items with new context
    if (!mockMemory[watchlist_id]) {
      mockMemory[watchlist_id] = { items: [] };
    }
    mockMemory[watchlist_id].items.unshift(
      `Synthesized analysis on ${new Date(timestamp).toLocaleDateString()}: Headline "${newAnalysis.headline.slice(0, 60)}..."`
    );

    return newAnalysis;
  },

  async getNotes(watchlistId) {
    await delay(200);
    return [...(mockNotes[watchlistId] || [])];
  },

  async addNote({ watchlist_id, note }) {
    await delay(250);
    if (!note || !note.trim()) {
      throw new Error('Note content cannot be empty');
    }
    const newNote = {
      id: `note-${Date.now()}`,
      watchlist_id: String(watchlist_id),
      note: note.trim(),
      created_at: new Date().toISOString(),
    };
    if (!mockNotes[watchlist_id]) {
      mockNotes[watchlist_id] = [];
    }
    mockNotes[watchlist_id].unshift(newNote);

    // Also register in memory
    if (!mockMemory[watchlist_id]) {
      mockMemory[watchlist_id] = { items: [] };
    }
    mockMemory[watchlist_id].items.unshift(`Analyst Note added: "${note.trim().slice(0, 70)}..."`);

    return newNote;
  },

  async getMemory(watchlistId) {
    await delay(200);
    const mem = mockMemory[watchlistId] || { items: [] };
    return { items: [...mem.items] };
  },
};
