export type WorkOrder = {
  id: string;
  title: string;
  description: string;
  location : {
    city: string;
    state: string;
    zip: string;
  };
  completedDate: string;
  totalPaid: number;
  proName: string;
  proId: string;
  photos: string[];
  verifiedAtMonths: number;
  isFairPrice: boolean;
};