-- RailGaadi Supabase Database Schema
-- Run this script in the Supabase SQL Editor to configure your database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==================================================
-- 1. PROFILES TABLE
-- ==================================================
create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    "authUserId" uuid references auth.users(id) on delete cascade unique,
    "fullName" text not null,
    email text not null unique,
    phone text,
    "avatarUrl" text,
    "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==================================================
-- 2. EMERGENCY CONTACTS TABLE
-- ==================================================
create table public.emergency_contacts (
    id uuid primary key default gen_random_uuid(),
    "userId" uuid references auth.users(id) on delete cascade not null,
    name text not null,
    relationship text not null,
    phone text not null,
    "isPrimary" boolean default false not null,
    "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==================================================
-- 3. USER FAVOURITE TRAINS TABLE
-- ==================================================
create table public.user_favourite_trains (
    id uuid primary key default gen_random_uuid(),
    "userId" uuid references auth.users(id) on delete cascade not null,
    "trainNumber" text not null,
    "trainName" text not null,
    "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_user_favourite_train unique ("userId", "trainNumber")
);

-- ==================================================
-- 4. RECENT SEARCHES TABLE
-- ==================================================
create table public.recent_searches (
    id uuid primary key default gen_random_uuid(),
    "userId" uuid references auth.users(id) on delete cascade not null,
    "trainNumber" text not null,
    "trainName" text not null,
    "searchedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==================================================
-- 5. EMERGENCY EVENTS TABLE
-- ==================================================
create table public.emergency_events (
    id uuid primary key default gen_random_uuid(),
    "userId" uuid references auth.users(id) on delete cascade not null,
    "trainNumber" text not null,
    "trainName" text not null,
    coach text,
    seat text,
    "currentStation" text,
    "nextStation" text,
    destination text,
    latitude double precision,
    longitude double precision,
    accuracy double precision,
    "networkStatus" text not null,
    status text default 'ACTIVE' not null,
    "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==================================================
-- 6. EMERGENCY COMMUNICATIONS TABLE
-- ==================================================
create table public.emergency_communications (
    id uuid primary key default gen_random_uuid(),
    "eventId" uuid references public.emergency_events(id) on delete cascade not null,
    recipient text not null,
    status text not null,
    type text not null,
    "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
    "sentAt" timestamp with time zone
);

-- ==================================================
-- ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ==================================================
alter table public.profiles enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.user_favourite_trains enable row level security;
alter table public.recent_searches enable row level security;
alter table public.emergency_events enable row level security;
alter table public.emergency_communications enable row level security;

-- ==================================================
-- RLS POLICIES
-- ==================================================

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = "authUserId");

create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = "authUserId");

create policy "Users can insert own profile" on public.profiles
    for insert with check (auth.uid() = "authUserId");

-- Emergency Contacts Policies
create policy "Users can select own emergency contacts" on public.emergency_contacts
    for select using (auth.uid() = "userId");

create policy "Users can insert own emergency contacts" on public.emergency_contacts
    for insert with check (auth.uid() = "userId");

create policy "Users can update own emergency contacts" on public.emergency_contacts
    for update using (auth.uid() = "userId");

create policy "Users can delete own emergency contacts" on public.emergency_contacts
    for delete using (auth.uid() = "userId");

-- Favourite Trains Policies
create policy "Users can select own favourites" on public.user_favourite_trains
    for select using (auth.uid() = "userId");

create policy "Users can insert own favourites" on public.user_favourite_trains
    for insert with check (auth.uid() = "userId");

create policy "Users can delete own favourites" on public.user_favourite_trains
    for delete using (auth.uid() = "userId");

-- Recent Searches Policies
create policy "Users can select own searches" on public.recent_searches
    for select using (auth.uid() = "userId");

create policy "Users can insert own searches" on public.recent_searches
    for insert with check (auth.uid() = "userId");

create policy "Users can delete own searches" on public.recent_searches
    for delete using (auth.uid() = "userId");

-- Emergency Events Policies
create policy "Users can select own emergency events" on public.emergency_events
    for select using (auth.uid() = "userId");

create policy "Users can insert own emergency events" on public.emergency_events
    for insert with check (auth.uid() = "userId");

create policy "Users can update own emergency events" on public.emergency_events
    for update using (auth.uid() = "userId");

-- Emergency Communications Policies
create policy "Users can select own communications" on public.emergency_communications
    for select using (
        exists (
            select 1 from public.emergency_events 
            where emergency_events.id = emergency_communications."eventId" 
            and emergency_events."userId" = auth.uid()
        )
    );

create policy "Users can insert own communications" on public.emergency_communications
    for insert with check (
        exists (
            select 1 from public.emergency_events 
            where emergency_events.id = emergency_communications."eventId" 
            and emergency_events."userId" = auth.uid()
        )
    );

-- ==================================================
-- PROFILE AUTOMATION TRIGGER
-- ==================================================
-- Create trigger to automatically insert profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, "authUserId", "fullName", email, phone, "avatarUrl")
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'avatarUrl', '')
  );

  if new.raw_user_meta_data->>'emergencyName' is not null and new.raw_user_meta_data->>'emergencyPhone' is not null then
    insert into public.emergency_contacts ("userId", name, relationship, phone, "isPrimary")
    values (
      new.id,
      new.raw_user_meta_data->>'emergencyName',
      coalesce(new.raw_user_meta_data->>'emergencyRelationship', 'Parent'),
      new.raw_user_meta_data->>'emergencyPhone',
      true
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==================================================
-- 7. BOOKINGS TABLE
-- ==================================================
create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    pnr text not null,
    train_number text not null,
    train_name text not null,
    from_station_code text not null,
    from_station_name text not null,
    to_station_code text not null,
    to_station_name text not null,
    journey_date text not null,
    departure_time text,
    arrival_time text,
    class_code text,
    booking_status text default 'CONFIRMED' not null,
    boarding_station_code text,
    boarding_station_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_user_pnr unique (user_id, pnr)
);

-- ==================================================
-- 8. BOOKING PASSENGERS TABLE
-- ==================================================
create table if not exists public.booking_passengers (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid references public.bookings(id) on delete cascade not null,
    name text not null,
    age integer,
    gender text,
    coach text,
    berth text,
    berth_number text,
    berth_type text,
    booking_status text default 'CONFIRMED' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Enablement
alter table public.bookings enable row level security;
alter table public.booking_passengers enable row level security;

-- Bookings RLS Policies
create policy "Users can select own bookings" on public.bookings
    for select using (auth.uid() = user_id);

create policy "Users can insert own bookings" on public.bookings
    for insert with check (auth.uid() = user_id);

create policy "Users can update own bookings" on public.bookings
    for update using (auth.uid() = user_id);

create policy "Users can delete own bookings" on public.bookings
    for delete using (auth.uid() = user_id);

-- Booking Passengers RLS Policies
create policy "Users can select own booking passengers" on public.booking_passengers
    for select using (
        exists (
            select 1 from public.bookings 
            where bookings.id = booking_passengers.booking_id 
            and bookings.user_id = auth.uid()
        )
    );

create policy "Users can insert own booking passengers" on public.booking_passengers
    for insert with check (
        exists (
            select 1 from public.bookings 
            where bookings.id = booking_passengers.booking_id 
            and bookings.user_id = auth.uid()
        )
    );

create policy "Users can delete own booking passengers" on public.booking_passengers
    for delete using (
        exists (
            select 1 from public.bookings 
            where bookings.id = booking_passengers.booking_id 
            and bookings.user_id = auth.uid()
        )
    );

-- Indexes
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_pnr on public.bookings(pnr);
create index if not exists idx_bookings_journey_date on public.bookings(journey_date);
create index if not exists idx_bookings_train_number on public.bookings(train_number);

