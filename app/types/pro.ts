export type Pro = {
  id: string;
  name: string;
  type: string;
  yearsInBusiness: number;
  distanceMiles: number;
  tags: string[];
  checks: {
    licenseCurrent: boolean;
    insuranceVerified: boolean;
    backgroundChecked: boolean;
    epa608Cert: boolean;
  };
  outcomeScore: number;
  vsFair: number;
}

// --- Full pro profile page (app/pro/[id]) ---

export type ProVerification = {
  title: string;
  detail: string;
  status: string; // e.g. "Verified · 11 days ago"
};

export type ProStat = {
  value: string; // e.g. "96%", "42 min", "+4%"
  label: string;
  sublabel: string;
};

export type ProReviewScore = {
  label: string;
  score: number; // out of 10
};

export type ProProfile = {
  id: string;
  initials: string;
  name: string;
  type: string; // "Family-owned"
  location: string; // "Rancho Santa Margarita, CA"
  yearsOperating: number;
  tags: string[];
  outcomeScore: number;
  verification: ProVerification[];
  performance: ProStat[];
  reviews: ProReviewScore[];
};