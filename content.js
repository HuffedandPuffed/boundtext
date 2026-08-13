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
    contactEmail: "contact@boundtext.com",
    directSalesNote:
      "Books can also be ordered through local bookstores. Limited signed copies of Standard Operating Silence are available directly upon request."
  },

  authors: [
    {
      id: "colin-bamforth",
      name: "Colin Bamforth",
      role: "Publisher, Practical Nonfiction Author & Puzzle-Book Creator",
      initials: "CB",
      image: "assets/Colin.webp",
      bio: "Colin Bamforth is the visionary behind Bound Text & Huffed and Puffed Publishing. Operating at the intersection of structure and creativity, Colin is a dedicated practical nonfiction author and puzzle-book creator. Driven by a mission to champion human voices and amplify 'useful sparks,' he curates and designs books that engage the mind, challenge curious readers, and bring high-quality independent publishing to life.",
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
    enabled: false,
    paymentPageUrl: "#payment-placeholder",
    label: "Buy direct from Colin",
    appliesToAuthor: "Colin Bamforth"
  },

  books: [
    {
      title: "Standard Operating Silence",
      subtitle: "The truth was never meant to survive.",
      author: "Colin Bamforth",
      asin: "B0HDMKSXN3",
      isbn: "978-1067101077",
      signedCopy: true,
      category: "International thriller",
      direct: false,
      coverImage: "assets/covers/SOS.webp",
      description: "Former reconnaissance soldier, paramedic, and clinical educator Raf Rodriguez is used to trauma, chaos, and pressure. When unrelated incidents begin to overlap, altered reports and missing details point toward a conspiracy protected by procedure. A gripping thriller of emergency medicine, law enforcement, institutional self-interest, and the danger of asking the wrong questions."
    },
    {
      title: "Shift Change",
      subtitle: "A Paramedic's Story - What survives when the sirens go silent",
      author: "Colin Bamforth",
      asin: "B0FD8C7P1H",
      isbn: "978-1067093204",
      signedCopy: false,
      category: "Fictional biography",
      direct: false,
      coverImage: "assets/covers/shift-change.webp",
      description: "Set in the fictional city of Thamesreach and written with lived emotional realism, Shift Change follows paramedic Naomi Kerslake through the brutal, beautiful, and relentlessly human work behind the uniform. This revised second edition expands the scenes and deepens the quiet trauma, courage, burnout, and resilience that remain when the sirens go silent."
    },
    {
      title: "Overwhelmed by Stress?",
      subtitle: "A science-backed guide to reducing stress, regaining clarity, and restoring balance. US Edition",
      author: "Colin Bamforth",
      asin: "B0F8GF76M2",
      isbn: "",
      signedCopy: false,
      category: "Self-help",
      direct: false,
      coverImage: "assets/covers/overwhelmed-by-stress-us.webp",
      description: "A clear, compassionate guide for readers who feel constantly on edge, overloaded, or unable to find breathing room. Drawing on nearly 40 years of paramedic experience across New Zealand, Australia, and the UK, Colin Bamforth offers practical, body-based strategies for understanding stress, recovering clarity, and carrying life's pressures differently."
    },
    {
      title: "Overwhelmed by Stress?",
      subtitle: "A science-backed guide to reducing stress, regaining clarity, and restoring balance. Australia and New Zealand Edition",
      author: "Colin Bamforth",
      asin: "B0FFSLSV2G",
      isbn: "978-1067093211",
      signedCopy: false,
      category: "Self-help",
      direct: false,
      coverImage: "assets/covers/overwhelmed-by-stress-au-nz.webp",
      description: "A practical Australia and New Zealand edition for readers facing burnout, transition, grief, overload, or uncertainty. This is not a book of quick fixes or forced positivity, but a grounded guide to walking with stress, using small repeatable steps to restore balance, clarity, and meaning."
    },
    {
      title: "Motorcycle Word Search",
      author: "Colin Bamforth",
      asin: "B0F5QCYXNP",
      isbn: "",
      signedCopy: false,
      category: "Puzzle books",
      direct: false,
      coverImage: "assets/covers/motorcycle-word-search.webp",
      description: "A themed word-search collection for motorcycle enthusiasts, built for relaxed concentration and easy gifting."
    },
    {
      title: "Construction Word Search",
      author: "Colin Bamforth",
      asin: "B0F5QVCCJ7",
      isbn: "",
      signedCopy: false,
      category: "Puzzle books",
      direct: false,
      coverImage: "assets/covers/construction-word-search.webp",
      description: "A construction-themed puzzle book for readers who enjoy site language, tools, trades, and a satisfying pencil-and-paper break."
    },
    {
      title: "Fishing Word Search",
      author: "Colin Bamforth",
      asin: "B0F5HYQQKX",
      isbn: "",
      signedCopy: false,
      category: "Puzzle books",
      direct: false,
      coverImage: "assets/covers/fishing-word-search.webp",
      description: "A quiet catch for puzzle fans, built around fishing terms, tackle, waters, and the easy rhythm of a good word search."
    }
  ],

  privatePage: {
    demoPassword: "change-me",
    demoPasswords: ["change-me"],
    warning: "This prototype password gate is client-side only. It is useful for drafts and convenience, but not for genuinely private files. Real file management should use server-side authentication."
  }
};
