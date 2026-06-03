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