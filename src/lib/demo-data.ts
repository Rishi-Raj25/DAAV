export type BoardListing = {
  id: string;
  name: string;
  website: string;
  category: string;
  description: string;
  amountPaise: number;
  verified: boolean;
  initials: string;
};

// Demo-only data. Never treat these listings or amounts as real businesses or payments.
export const demoListings: BoardListing[] = [
  { id: "demo-1", name: "Udaan Labs", website: "https://example.com", category: "Indian SaaS", description: "Tools that help small businesses grow.", amountPaise: 1250000, verified: true, initials: "UL" },
  { id: "demo-2", name: "Neem AI", website: "https://example.com", category: "AI & Tech", description: "Useful AI tools, built in India.", amountPaise: 875000, verified: true, initials: "N" },
  { id: "demo-3", name: "ChaiStack", website: "https://example.com", category: "Developer Tools", description: "A simpler stack for the next generation of makers.", amountPaise: 525000, verified: false, initials: "CS" },
  { id: "demo-4", name: "Mitti Studio", website: "https://example.com", category: "Design & Creator", description: "Independent design for ambitious ideas.", amountPaise: 300000, verified: true, initials: "MS" },
];

export const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
