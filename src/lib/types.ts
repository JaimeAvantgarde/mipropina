export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logo_emoji: string;
  logo_url: string | null;
  theme_color: string;
  manager_id: string | null;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;
  tip_amounts: number[];
  custom_amount_enabled: boolean;
  thank_you_message: string | null;
  email_notifications_enabled: boolean;
  notification_email: string | null;
  google_maps_url: string | null;
  split_includes_owner: boolean;
  created_at: string;
  deleted_at: string | null;
};

export type StaffRole = "manager" | "waiter" | "kitchen";
export type StaffStatus = "active" | "pending" | "inactive";

export type Staff = {
  id: string;
  restaurant_id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone: string;
  avatar_emoji: string;
  role: StaffRole;
  stripe_payout_id: string | null;
  stripe_payouts_enabled: boolean;
  active: boolean;
  status: StaffStatus;
  default_share_pct: number | null;
  created_at: string;
};

export type TipStatus = "pending" | "completed" | "failed" | "refunded";

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
  request_hash: string | null;
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
  token: string;
  phone: string;
  name: string;
  role: StaffRole;
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
