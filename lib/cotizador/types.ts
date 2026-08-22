export type ComparisonSection = {
  id: string;
  title: string;
  intro: string | null;
  note: string | null;
};

export type ComparisonPriceTier = {
  guestCount: number;
  price: number;
};

export type ComparisonPlan = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  price: number | null;
  priceTiers: ComparisonPriceTier[];
  description: string | null;
  published: boolean;
  sections: ComparisonSection[];
};

export type ComparisonCategory = {
  id: string;
  slug: string;
  title: string;
  plans: ComparisonPlan[];
};
