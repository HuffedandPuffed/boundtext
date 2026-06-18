/*
  Bound Text Publishing content file.
  Edit this file to add authors, books, Amazon marketplaces, direct-sale links,
  launch notices, and private-page settings.
*/

window.HP_CONTENT = {
  company: {
    name: "Bound Text Publishing",
    strapline: "Independent books with craft, nerve, and a quiet spark of mischief.",
    intro:
      "A small press for sharp-edged fiction, practical books, and word search books. We keep the list focused, the voice human, and the door open for curious readers.",
    contactEmail: "hello@example.com",
    directSalesNote:
      "Direct purchase links are placeholders until a payment page is chosen. Stripe Payment Links, PayPal checkout, or Shopify Starter are good low-maintenance options."
  },

authors: [
  {
    id: "colin-bamforth",
    name: "Colin Bamforth",
    role: "Publisher, Practical Nonfiction Author & Puzzle-Book Creator",
    initials: "CB",
    image: "assets/Colin.jpg",
    bio: "Colin Bamforth is the visionary behind Bound Text & Huffed and Puffed Publishing. Operating at the intersection of structure and creativity, Colin is a dedicated practical nonfiction author and puzzle-book creator. Driven by a mission to champion human voices and amplify 'useful sparks,' he curates and designs books that engage the mind, challenge curious readers, and bring high-quality independent publishing to life.",
    note: ""
  },
  {
    id: "avery-solene",
    name: "Avery Solene",
    role: "Fiction & Contemporary Author",
    initials: "AS",
    image: "assets/Avery.jpg",
    bio: "Born in Paris and previously based in the United Kingdom, Avery Solene has called Quebec, Canada home for the last eight years. Having transitioned from a multi-year background in the adult entertainment industry into a senior corporate executive role for a massive multi-national retail company, Avery writes with a profound, completely unfiltered understanding of reinvention, modern commerce, and the complex layers of human nature.",
    note: ""
  },
  {
    id: "russell-bruce",
    name: "Russell Bruce",
    role: "Fiction Author",
    initials: "RB",
    image: "assets/Russell.jpg",
    bio: "Russell Bruce is a retired physics lecturer from the United Kingdom who has pursued creative writing as a passionate hobby since his late twenties. Infusing his narratives with the analytical precision of a scientist alongside the warmth of a lifelong storyteller, Russell crafts sharp-edged fiction that explores the intricate mechanics of human relationships and the wonders of the everyday world.",
    note: ""
  }
],
  marketplaces: [
    { code: "US", label: "United States", host: "www.amazon.com", default: true },
    { code: "UK", label: "United Kingdom", host: "www.amazon.co.uk" },
    { code: "AU", label: "Australia", host: "www.amazon.com.au" },
    { code: "CA", label: "Canada", host: "www.amazon.ca" },
    { code: "DE", label: "Germany", host: "www.amazon.de" },
    { code: "FR", label: "France", host: "www.amazon.fr" },
    { code: "IT", label: "Italy", host: "www.amazon.it" },
    { code: "ES", label: "Spain", host: "www.amazon.es" },
    { code: "JP", label: "Japan", host: "www.amazon.co.jp" }
  ],

  directSales: {
    enabled: true,
    paymentPageUrl: "#payment-placeholder",
    label: "Buy direct from Colin",
    appliesToAuthor: "Colin Bamforth"
  },

  books: [
    {
      title: "Standard Operating Silence",
      subtitle: "The truth was never meant to survive.",
      author: "Colin Bamforth",
      asin: "",
      category: "International thriller",
      status: "Pending September 2026",
      direct: false,
      coverImage: "assets/covers/standard-operating-silence.jpg",
      description: "Former reconnaissance soldier, paramedic, and clinical educator Raf Rodriguez is used to trauma, chaos, and pressure. When unrelated incidents begin to overlap, altered reports and missing details point toward a conspiracy protected by procedure. A gripping thriller of emergency medicine, law enforcement, institutional self-interest, and the danger of asking the wrong questions."
    },
    {
      title: "Shift Change",
      subtitle: "A Paramedic's Story - What survives when the sirens go silent",
      author: "Colin Bamforth",
      asin: "B0FD8C7P1H",
      category: "Fictional biography",
      direct: true,
      coverImage: "assets/covers/shift-change.jpg",
      description: "Set in the fictional city of Thamesreach and written with lived emotional realism, Shift Change follows paramedic Naomi Kerslake through the brutal, beautiful, and relentlessly human work behind the uniform. This revised second edition expands the scenes and deepens the quiet trauma, courage, burnout, and resilience that remain when the sirens go silent."
    },
    {
      title: "Overwhelmed by Stress?",
      subtitle: "A science-backed guide to reducing stress, regaining clarity, and restoring balance. US Edition",
      author: "Colin Bamforth",
      asin: "B0F8GF76M2",
      category: "Self-help",
      direct: false,
      coverImage: "assets/covers/overwhelmed-by-stress-us.jpg",
      description: "A clear, compassionate guide for readers who feel constantly on edge, overloaded, or unable to find breathing room. Drawing on nearly 40 years of paramedic experience across New Zealand, Australia, and the UK, Colin Bamforth offers practical, body-based strategies for understanding stress, recovering clarity, and carrying life's pressures differently."
    },
    {
      title: "Overwhelmed by Stress?",
      subtitle: "A science-backed guide to reducing stress, regaining clarity, and restoring balance. Australia and New Zealand Edition",
      author: "Colin Bamforth",
      asin: "B0FFSLSV2G",
      category: "Self-help",
      direct: false,
      coverImage: "assets/covers/overwhelmed-by-stress-au-nz.jpg",
      description: "A practical Australia and New Zealand edition for readers facing burnout, transition, grief, overload, or uncertainty. This is not a book of quick fixes or forced positivity, but a grounded guide to walking with stress, using small repeatable steps to restore balance, clarity, and meaning."
    },
    {
      title: "Motorcycle Word Search",
      author: "Colin Bamforth",
      asin: "B0F5QCYXNP",
      category: "Puzzle books",
      direct: false,
      coverImage: "assets/covers/motorcycle-word-search.jpg",
      description: "A themed word-search collection for motorcycle enthusiasts, built for relaxed concentration and easy gifting."
    },
    {
      title: "Construction Word Search",
      author: "Colin Bamforth",
      asin: "B0F5QVCCJ7",
      category: "Puzzle books",
      direct: false,
      coverImage: "assets/covers/construction-word-search.jpg",
      description: "A construction-themed puzzle book for readers who enjoy site language, tools, trades, and a satisfying pencil-and-paper break."
    },
    {
      title: "Fishing Word Search",
      author: "Colin Bamforth",
      asin: "B0F5HYQQKX",
      category: "Puzzle books",
      direct: false,
      coverImage: "assets/covers/fishing-word-search.jpg",
      description: "A quiet catch for puzzle fans, built around fishing terms, tackle, waters, and the easy rhythm of a good word search."
    },
    {
      title: "Lessons in Surrender",
      subtitle: "She didn't ask. She taught him what pleasure really means.",
      author: "Russell Bruce",
      asin: "B0F8RFX2Z3",
      category: "Adult fiction",
      direct: false,
      coverImage: "assets/covers/lessons-in-surrender.jpg",
      description: "A bold adult-fiction journey into dominance, submission, and the pleasure of letting go. When a younger man is chosen by Vicky, a sophisticated and commanding woman twenty years his senior, one unforgettable dinner opens into a secret world of rules, restraint, trust, and awakening."
    },
    {
      title: "Lessons in Control",
      subtitle: "Some love demands surrender. Others demand control.",
      author: "Russell Bruce",
      asin: "B0F9BMS39N",
      category: "Adult fiction",
      direct: false,
      coverImage: "assets/covers/lessons-in-control.jpg",
      description: "The final chapter in the Lessons series brings Mark, Vicky, and their intimate circle to a charged conclusion. With old loyalties shifting and new roles emerging, Lessons in Control explores sexual sovereignty, lasting love, and the exquisite tension between dominance and surrender."
    },
    {
      title: "Lessons in Loyalty",
      subtitle: "Behind closed doors, every heart is for sale.",
      author: "Russell Bruce",
      asin: "B0F8Y5C9LT",
      category: "Adult fiction",
      direct: false,
      coverImage: "assets/covers/lessons-in-loyalty.jpg",
      description: "Mark and Vicky live inside an open relationship built on power, consent, and absolute trust. At The Vicarage, pleasure is curated and loyalty is earned, but past lovers, new temptations, and personal business begin to blur the line between ownership and intimacy."
    },
    {
      title: "Lessons in Trust",
      subtitle: "When everything is shared, nothing is hidden.",
      author: "Russell Bruce",
      asin: "B0FH7556NG",
      category: "Adult fiction",
      direct: false,
      coverImage: "assets/covers/lessons-in-trust.jpg",
      description: "Mark and Vicky return more open, exposed, and connected than ever. From private weekends to acts of surrender behind closed doors, this third Lessons title asks what happens when dominance meets devotion and pleasure demands truth."
    },
    {
      title: "Imogen: The First Taste of Power",
      author: "Avery Solene",
      asin: "B0FVPX85L8",
      category: "Adult fiction",
      direct: false,
      coverImage: "assets/covers/imogen-the-first-taste-of-power.jpg",
      description: "Book one in the Imogen series. Imogen is eighteen, brilliant, and determined to live on her own terms. At university she studies design, psychology, people, pleasure, and power, learning that every encounter can become a test of control."
    },
    {
      title: "Imogen: The Art of Wanting",
      author: "Avery Solene",
      asin: "B0FVTSKHZ5",
      category: "Adult fiction",
      direct: false,
      coverImage: "assets/covers/imogen-the-art-of-wanting.jpg",
      description: "Desire is easy. Control takes skill. In London, Imogen Hartley moves through galleries, lecture halls, private penthouses, and blurred boundaries, refining the art of influence while deciding whether control is freedom or another form of restraint."
    },
    {
      title: "Imogen: Brass and Silk",
      author: "Avery Solene",
      asin: "B0FVTC8CYM",
      category: "Adult fiction",
      direct: false,
      coverImage: "assets/covers/imogen-brass-and-silk.jpg",
      description: "Power is neither hard nor soft. It is both: brass and silk. From Paris to Milan, Imogen no longer studies desire; she orchestrates it, balancing architecture, art, ambition, devotion, rivalry, and the cost of mastering everything around her."
    },
    {
      title: "Calculated Encounters",
      subtitle: "A Working Girl's Journey Through Risk, Control and Gain",
      author: "Avery Solene",
      asin: "B0GPGKXQ3T",
      category: "Adult fiction",
      direct: false,
      coverImage: "assets/covers/calculated-encounters.jpg",
      description: "Based strongly on lived events, Calculated Encounters follows Aveline from a fading seaside hotel bar into a world of boundaries, discretion, strategy, and survival. Part erotic realism and part diary of ambition, it is a bold exploration of autonomy, risk, control, and the hidden currencies of power."
    }
  ],

  privatePage: {
    demoPassword: "change-me",
    demoPasswords: ["change-me"],
    warning: "This prototype password gate is client-side only. It is useful for drafts and convenience, but not for genuinely private files. Real file management should use server-side authentication."
  }
};

