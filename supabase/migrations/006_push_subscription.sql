create table if not exists push_subscription (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  restaurant_id uuid not null references restaurant(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(endpoint)
);

create index idx_push_sub_restaurant on push_subscription(restaurant_id);
