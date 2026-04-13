export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logo_emoji: string;
  logo_url: string | null;
  theme_color: string;
  owner_id: string;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;
  tip_amounts: number[];
  custom_amount_enabled: boolean;
  thank_you_message: string | null;
  email_notifications_enabled: boolean;
  notification_email: string | null;
  google_maps_url: string | null;
  created_at: string;
};

export type StaffRole = "owner" | "waiter";

export type Staff = {
  id: string;
  restaurant_id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  avatar_emoji: string;
  role: StaffRole;
  iban: string | null;
  stripe_payout_id: string | null;
  stripe_payouts_enabled: boolean;
  active: boolean;
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
