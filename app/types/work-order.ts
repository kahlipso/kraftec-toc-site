export type PriceLine = { label: string; value: string };
export type ScorePill = { value: string; label: string };

export type WorkOrderFeedback = {
  initials: string;
  name: string;
  meta: string; // "Homeowner · Phoenix, AZ · Verified buyer"
  reviewedNote: string; // "Reviewed 12 months after job · March 14, 2026"
  quote: string;
  scores: ScorePill[];
};

export type WorkOrder = {
  // --- Shared / card fields (used by the homepage WorkOrderCard) ---
  id: string;
  title: string; // short title for the card
  description: string;
  location: {
    city: string;
    state: string;
    zip: string;
  };
  completedDate: string;
  totalPaid: number;
  proName: string;
  proInitials: string;
  proId: string;
  photos: string[];
  photoCount: number;
  verifiedAtMonths: number;
  isFairPrice: boolean;

  // --- Detail-page fields ---
  headline: string; // long title, e.g. "Full AC system replacement — 3-ton"
  headlineHighlight: string; // red italic part, e.g. "Carrier heat pump"
  outcomeScore: number; // e.g. 96
  duration: string; // e.g. "4 hr 20 min"
  walkedInto: string; // "What we walked into" narrative
  whatWeDid: string[]; // "What we did" bullet list
  priceBreakdown: PriceLine[]; // Diagnostic / Equipment / Labor / ...
  fairRangeNote: string; // "In the fair range for this region"
  feedback: WorkOrderFeedback;
};
