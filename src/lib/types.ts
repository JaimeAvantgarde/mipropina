export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logo_emoji: string;
  logo_url: string | null;
  theme_color: string;
  owner_id: string;
  stripe_account_id: string | null;
  created_at: string;
};

export type StaffRole = "owner" | "waiter";

export type Staff = {
  id: string;
  restaurant_id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone: string;
  avatar_emoji: string;
  role: StaffRole;
  iban: string | null;
  stripe_payout_id: string | null;
  active: boolean;
  created_at: string;
};

export type TipStatus = "pending" | "completed" | "failed";

export type Tip = {
  id: string;
  restaurant_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  stripe_payment_id: string;
  status: TipStatus;
  customer_session: string | null;
  created_at: string;
};

export type DistributionMethod = "equal" | "hours" | "custom";
export type DistributionStatus = "pending" | "distributed";

export type Distribution = {
  id: string;
  restaurant_id: string;
  week_start: string;
  week_end: string;
  total_cents: number;
  method: DistributionMethod;
  status: DistributionStatus;
  created_by: string;
  created_at: string;
};

export type PayoutStatus = "pending" | "sent" | "failed";

export type Payout = {
  id: string;
  distribution_id: string;
  staff_id: string;
  amount_cents: number;
  stripe_transfer_id: string | null;
  status: PayoutStatus;
  paid_at: string | null;
};

export type InviteCode = {
  id: string;
  restaurant_id: string;
  code: string;
  phone: string;
  name: string;
  used: boolean;
  expires_at: string;
  created_at: string;
};

export type QRCode = {
  id: string;
  restaurant_id: string;
  table_label: string;
  url: string;
  created_at: string;
};
