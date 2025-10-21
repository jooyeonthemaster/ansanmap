-- Supabase Database Schema for Ansanmap Festival App
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (device-based identification)
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  device_id text unique not null,
  total_points integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Booths table
create table if not exists booths (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  description text not null,
  coordinates jsonb not null, -- Array of {lat, lng}
  operating_hours text not null,
  contact text,
  menu_items text[],
  price text,
  is_active boolean default true,
  congestion_level text check (congestion_level in ('low', 'medium', 'high', 'very-high')),
  waiting_time integer,
  webcam_url text,
  popularity_score numeric(3, 2),
  current_visitors integer default 0,
  max_capacity integer,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Favorites table
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  booth_id uuid references booths(id) on delete cascade,
  notification_enabled boolean default false,
  created_at timestamptz default now(),
  unique(user_id, booth_id)
);

-- Check-ins table
create table if not exists check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  booth_id uuid references booths(id) on delete cascade,
  points integer default 10,
  created_at timestamptz default now()
);

-- Announcements table
create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_booths_category on booths(category);
create index if not exists idx_booths_is_active on booths(is_active);
create index if not exists idx_booths_congestion on booths(congestion_level);
create index if not exists idx_favorites_user on favorites(user_id);
create index if not exists idx_favorites_booth on favorites(booth_id);
create index if not exists idx_checkins_user on check_ins(user_id);
create index if not exists idx_checkins_booth on check_ins(booth_id);
create index if not exists idx_announcements_priority on announcements(priority);
create index if not exists idx_announcements_expires on announcements(expires_at);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_booths_updated_at before update on booths
  for each row execute function update_updated_at_column();

create trigger update_users_updated_at before update on users
  for each row execute function update_updated_at_column();

-- Row Level Security (RLS)
alter table booths enable row level security;
alter table favorites enable row level security;
alter table check_ins enable row level security;
alter table announcements enable row level security;
alter table users enable row level security;

-- Public read access for booths and announcements
create policy "Booths are viewable by everyone"
  on booths for select
  using (true);

create policy "Announcements are viewable by everyone"
  on announcements for select
  using (expires_at is null or expires_at > now());

-- Authenticated users can insert/update booths (for admin)
create policy "Authenticated users can insert booths"
  on booths for insert
  with check (true);

create policy "Authenticated users can update booths"
  on booths for update
  using (true);

create policy "Authenticated users can delete booths"
  on booths for delete
  using (true);

-- Users can manage their own favorites
create policy "Users can view their own favorites"
  on favorites for select
  using (true);

create policy "Users can insert their own favorites"
  on favorites for insert
  with check (true);

create policy "Users can delete their own favorites"
  on favorites for delete
  using (true);

create policy "Users can update their own favorites"
  on favorites for update
  using (true);

-- Users can manage their own check-ins
create policy "Users can view their own check-ins"
  on check_ins for select
  using (true);

create policy "Users can insert their own check-ins"
  on check_ins for insert
  with check (true);

-- Users table policies
create policy "Users can view all users"
  on users for select
  using (true);

create policy "Users can insert themselves"
  on users for insert
  with check (true);

create policy "Users can update themselves"
  on users for update
  using (true);

-- Function to get or create user by device_id
create or replace function get_or_create_user(device_id_param text)
returns uuid as $$
declare
  user_uuid uuid;
begin
  select id into user_uuid from users where device_id = device_id_param;

  if user_uuid is null then
    insert into users (device_id) values (device_id_param) returning id into user_uuid;
  end if;

  return user_uuid;
end;
$$ language plpgsql;

-- Function to calculate total points for a user
create or replace function calculate_user_points(user_uuid uuid)
returns integer as $$
declare
  total integer;
begin
  select coalesce(sum(points), 0) into total from check_ins where user_id = user_uuid;
  update users set total_points = total where id = user_uuid;
  return total;
end;
$$ language plpgsql;

-- Realtime publication for live updates
-- Enable realtime for specific tables
alter publication supabase_realtime add table booths;
alter publication supabase_realtime add table announcements;
alter publication supabase_realtime add table check_ins;