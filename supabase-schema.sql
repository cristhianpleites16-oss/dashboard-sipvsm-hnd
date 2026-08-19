create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique,
  full_name text,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  site text not null default 'todas',
  sections jsonb not null default '["environmental"]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Authenticated users can read profiles'
  ) then
    create policy "Authenticated users can read profiles"
      on public.profiles for select
      to authenticated
      using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Admins can update profiles') then
    create policy "Admins can update profiles"
      on public.profiles for update to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end;
$$;

create table if not exists public.earthranger_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  external_id text,
  url text not null,
  token text not null,
  regional text,
  days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_site_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id uuid not null references public.earthranger_sites(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, site_id)
);

alter table public.earthranger_sites enable row level security;
alter table public.user_site_access enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='earthranger_sites' and policyname='Users can read assigned EarthRanger sites') then
    create policy "Users can read assigned EarthRanger sites"
      on public.earthranger_sites for select to authenticated
      using (
        public.is_admin()
        or exists (select 1 from public.user_site_access a where a.site_id = id and a.user_id = auth.uid())
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='earthranger_sites' and policyname='Admins can manage EarthRanger sites') then
    create policy "Admins can manage EarthRanger sites"
      on public.earthranger_sites for all to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='earthranger_sites' and policyname='Users can read their profile site') then
    create policy "Users can read their profile site"
      on public.earthranger_sites for select to authenticated
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and (p.site = earthranger_sites.name or p.site = earthranger_sites.external_id)
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_site_access' and policyname='Users can read their site access') then
    create policy "Users can read their site access"
      on public.user_site_access for select to authenticated
      using (user_id = auth.uid() or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_site_access' and policyname='Admins can manage site access') then
    create policy "Admins can manage site access"
      on public.user_site_access for all to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end;
$$;

create or replace function public.find_auth_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where lower(username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.find_auth_email_by_username(text) from public;
grant execute on function public.find_auth_email_by_username(text) to anon, authenticated;