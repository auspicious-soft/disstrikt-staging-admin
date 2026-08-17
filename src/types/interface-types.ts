export interface TableRow {
  [key: string]: string | number | boolean | undefined;
  jobTitle?: string;
  companyName?: string;
  country?: string;
  payout?: string;
  _id?: string;
  id?: number | string;
  name?: string;
  location?: string;
  city?: string;
  futureBookingCount?: number;
}