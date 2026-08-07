-- ============================================================
-- PIUMI WEB + COMISIONES + TIKFINITY
-- Esquema unificado e idempotente para Supabase.
-- Ejecuta este archivo completo desde Supabase > SQL Editor.
-- Conserva columnas heredadas y agrega las nuevas sin borrar datos.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Utilidades ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Configuración del sitio ----------
create table if not exists public.site_settings (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.terms_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  title text not null default 'Términos de servicio',
  content text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Galería ----------
create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  thumbnail_url text,
  artist_name text,
  artist_url text,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.artworks add column if not exists thumbnail_url text;
alter table public.artworks add column if not exists artist_name text;
alter table public.artworks add column if not exists artist_url text;
alter table public.artworks add column if not exists active boolean not null default true;
alter table public.artworks add column if not exists sort_order integer not null default 0;
alter table public.artworks add column if not exists updated_at timestamptz not null default now();

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text,
  group_name text not null default 'general',
  searchable boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.tags add column if not exists slug text;
alter table public.tags add column if not exists group_name text not null default 'general';
alter table public.tags add column if not exists searchable boolean not null default true;
alter table public.tags add column if not exists active boolean not null default true;

create unique index if not exists idx_tags_slug on public.tags (slug) where slug is not null;

create table if not exists public.artwork_tags (
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (artwork_id, tag_id)
);

-- ---------- Precios ----------
create table if not exists public.price_settings (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  style text not null,
  description text,
  price numeric(10,2),
  price_from numeric(10,2),
  price_to numeric(10,2),
  currency text not null default 'MXN',
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.price_settings add column if not exists description text;
alter table public.price_settings add column if not exists price numeric(10,2);
alter table public.price_settings add column if not exists price_from numeric(10,2);
alter table public.price_settings add column if not exists price_to numeric(10,2);
alter table public.price_settings add column if not exists currency text not null default 'MXN';
alter table public.price_settings add column if not exists image_url text;
alter table public.price_settings add column if not exists active boolean not null default true;
alter table public.price_settings add column if not exists sort_order integer not null default 0;
alter table public.price_settings add column if not exists updated_at timestamptz not null default now();

update public.price_settings
set price_from = coalesce(price_from, price)
where price_from is null;

-- ---------- Comisiones ----------
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  client_name text not null,
  client_email text not null,
  client_contact text,
  tiktok_username text,
  commission_type_id uuid,
  commission_type_label text not null default 'Comisión',
  character_name text not null default 'Sin título',
  character_description text,
  reference_urls text[] not null default '{}',
  pose_description text,
  usage_type text not null default 'personal',
  payment_method text not null default 'Por definir',
  additional_details text,
  estimated_price numeric(10,2),
  quoted_price numeric(10,2),
  paid_amount numeric(10,2) not null default 0,
  currency text not null default 'MXN',
  deadline date,
  priority text not null default 'normal',
  source text not null default 'web',
  platform text,
  show_in_public_queue boolean not null default true,
  public_alias text,
  terms_accepted boolean not null default false,
  terms_accepted_at timestamptz,
  terms_version text not null default 'v1',
  status text not null default 'solicitud',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commissions add column if not exists tracking_code text;
alter table public.commissions add column if not exists client_name text;
alter table public.commissions add column if not exists created_at timestamptz not null default now();
alter table public.commissions add column if not exists client_email text;
alter table public.commissions add column if not exists client_contact text;
alter table public.commissions add column if not exists tiktok_username text;
alter table public.commissions add column if not exists commission_type_id uuid;
alter table public.commissions add column if not exists commission_type_label text default 'Comisión';
alter table public.commissions add column if not exists character_name text default 'Sin título';
alter table public.commissions add column if not exists character_description text;
alter table public.commissions add column if not exists reference_urls text[] not null default '{}';
alter table public.commissions add column if not exists pose_description text;
alter table public.commissions add column if not exists usage_type text default 'personal';
alter table public.commissions add column if not exists payment_method text default 'Por definir';
alter table public.commissions add column if not exists additional_details text;
alter table public.commissions add column if not exists estimated_price numeric(10,2);
alter table public.commissions add column if not exists quoted_price numeric(10,2);
alter table public.commissions add column if not exists paid_amount numeric(10,2) not null default 0;
alter table public.commissions add column if not exists currency text not null default 'MXN';
alter table public.commissions add column if not exists deadline date;
alter table public.commissions add column if not exists priority text not null default 'normal';
alter table public.commissions add column if not exists source text not null default 'web';
alter table public.commissions add column if not exists platform text;
alter table public.commissions add column if not exists show_in_public_queue boolean not null default true;
alter table public.commissions add column if not exists public_alias text;
alter table public.commissions add column if not exists terms_accepted boolean not null default false;
alter table public.commissions add column if not exists terms_accepted_at timestamptz;
alter table public.commissions add column if not exists terms_version text not null default 'v1';
alter table public.commissions add column if not exists status text not null default 'solicitud';
alter table public.commissions add column if not exists updated_at timestamptz not null default now();

-- Compatibilidad con filas de la versión anterior. Las columnas antiguas
-- solo se consultan cuando realmente existen.
alter table public.commissions drop constraint if exists commissions_status_check;
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='commissions' and column_name='contact') then
    execute 'update public.commissions set client_email = coalesce(client_email, contact) where client_email is null';
    execute 'update public.commissions set client_contact = coalesce(client_contact, contact) where client_contact is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='commissions' and column_name='category') then
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='commissions' and column_name='style') then
      execute $cmd$update public.commissions set commission_type_label = coalesce(nullif(commission_type_label,''), nullif(concat_ws(' · ', category, style),''), 'Comisión') where commission_type_label is null or commission_type_label = ''$cmd$;
    else
      execute $cmd$update public.commissions set commission_type_label = coalesce(nullif(commission_type_label,''), nullif(category,''), 'Comisión') where commission_type_label is null or commission_type_label = ''$cmd$;
    end if;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='commissions' and column_name='notes') then
    execute $cmd$update public.commissions set character_name = coalesce(nullif(character_name,''), nullif(notes,''), 'Comisión') where character_name is null or character_name = ''$cmd$;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='commissions' and column_name='final_price') then
    execute 'update public.commissions set quoted_price = coalesce(quoted_price, final_price) where quoted_price is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='commissions' and column_name='extra_details') then
    execute 'update public.commissions set additional_details = coalesce(additional_details, extra_details) where additional_details is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='commissions' and column_name='progress_stage') then
    execute $cmd$update public.commissions
      set status = progress_stage
      where progress_stage in ('solicitud','revisando','cotizacion','esperando_pago','boceto','esperando_aprobacion','en_proceso','detalles_finales','terminado','entregado','cancelado')$cmd$;
  end if;
end $$;

update public.commissions set client_email = coalesce(client_email, '') where client_email is null;
update public.commissions set client_name = coalesce(client_name, 'Cliente') where client_name is null;
update public.commissions set commission_type_label = coalesce(nullif(commission_type_label,''), 'Comisión') where commission_type_label is null or commission_type_label = '';
update public.commissions set character_name = coalesce(nullif(character_name,''), 'Comisión') where character_name is null or character_name = '';
update public.commissions set usage_type = 'personal' where usage_type is null or usage_type not in ('personal','comercial');
update public.commissions set status = 'solicitud'
where status is null or status not in (
  'solicitud','revisando','cotizacion','esperando_pago','boceto',
  'esperando_aprobacion','en_proceso','detalles_finales','terminado',
  'entregado','cancelado'
);

alter table public.commissions add constraint commissions_status_check check (status in (
  'solicitud','revisando','cotizacion','esperando_pago','boceto',
  'esperando_aprobacion','en_proceso','detalles_finales','terminado',
  'entregado','cancelado'
));

alter table public.commissions drop constraint if exists commissions_usage_type_check;
alter table public.commissions add constraint commissions_usage_type_check check (usage_type in ('personal','comercial'));

create unique index if not exists idx_commissions_tracking on public.commissions (tracking_code) where tracking_code is not null;
create index if not exists idx_commissions_status on public.commissions (status);
create index if not exists idx_commissions_created on public.commissions (created_at desc);

create table if not exists public.progress_notes (
  id uuid primary key default gen_random_uuid(),
  commission_id uuid not null references public.commissions(id) on delete cascade,
  note text not null,
  image_url text,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_progress_notes_commission on public.progress_notes (commission_id, created_at desc);

-- ---------- TikFinity / TikTok LIVE ----------
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  external_room_id text,
  title text,
  status text not null default 'live' check (status in ('live','ended')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  current_viewers integer not null default 0,
  peak_viewers integer not null default 0,
  total_likes bigint not null default 0,
  total_gifts bigint not null default 0,
  total_diamonds bigint not null default 0,
  total_shares bigint not null default 0,
  new_followers bigint not null default 0,
  new_subscribers bigint not null default 0,
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_live_sessions_status on public.live_sessions (status, started_at desc);

create table if not exists public.live_users (
  id uuid primary key default gen_random_uuid(),
  tiktok_user_id text not null unique,
  unique_id text,
  nickname text,
  avatar_url text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_live_users_unique_id on public.live_users (unique_id);

create table if not exists public.live_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  session_id uuid references public.live_sessions(id) on delete set null,
  user_id uuid references public.live_users(id) on delete set null,
  event_type text not null,
  quantity bigint not null default 0,
  gift_id text,
  gift_name text,
  diamond_count bigint not null default 0,
  public_visible boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_live_events_session on public.live_events (session_id, occurred_at desc);
create index if not exists idx_live_events_type on public.live_events (event_type, occurred_at desc);

create table if not exists public.live_daily_user_stats (
  stat_date date not null,
  user_id uuid not null references public.live_users(id) on delete cascade,
  likes bigint not null default 0,
  gifts bigint not null default 0,
  diamonds bigint not null default 0,
  shares bigint not null default 0,
  follows bigint not null default 0,
  subscriptions bigint not null default 0,
  chats bigint not null default 0,
  last_event_at timestamptz not null default now(),
  primary key (stat_date, user_id)
);
create index if not exists idx_live_stats_date on public.live_daily_user_stats (stat_date desc);

create table if not exists public.live_bridge_status (
  singleton_key text primary key default 'default',
  status text not null default 'offline' check (status in ('online','offline','error')),
  connected_at timestamptz,
  last_seen_at timestamptz,
  last_error text,
  bridge_version text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.live_public_settings (
  singleton_key text primary key default 'default',
  public_title text not null default 'La comunidad de Piumi',
  public_subtitle text not null default 'Las huellas bonitas que dejó el directo de hoy.',
  show_daily_gifts boolean not null default true,
  show_daily_likes boolean not null default true,
  show_top_supporter boolean not null default true,
  show_top_liker boolean not null default true,
  show_recent_activity boolean not null default true,
  show_user_avatars boolean not null default true,
  leaderboard_limit integer not null default 5,
  updated_at timestamptz not null default now()
);

insert into public.live_bridge_status (singleton_key) values ('default') on conflict do nothing;
insert into public.live_public_settings (singleton_key) values ('default') on conflict do nothing;

-- ---------- Triggers ----------
do $$
declare table_name text;
begin
  foreach table_name in array array['site_settings','terms_versions','artworks','price_settings','commissions','live_sessions','live_users','live_bridge_status','live_public_settings']
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_' || table_name || '_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'trg_' || table_name || '_updated_at', table_name);
  end loop;
end $$;

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('artworks','artworks',true,8388608,array['image/png','image/jpeg','image/webp','image/gif']),
  ('site-assets','site-assets',true,8388608,array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- ---------- RLS ----------
alter table public.site_settings enable row level security;
alter table public.terms_versions enable row level security;
alter table public.artworks enable row level security;
alter table public.tags enable row level security;
alter table public.artwork_tags enable row level security;
alter table public.price_settings enable row level security;
alter table public.commissions enable row level security;
alter table public.progress_notes enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_users enable row level security;
alter table public.live_events enable row level security;
alter table public.live_daily_user_stats enable row level security;
alter table public.live_bridge_status enable row level security;
alter table public.live_public_settings enable row level security;

-- El sitio accede mediante Route Handlers con service_role. No se crean
-- políticas anónimas para evitar exponer clientes o eventos crudos.

-- ---------- Datos iniciales ----------
insert into public.site_settings (key, content)
values ('general', '{
  "brand":"Piumi",
  "heroKicker":"¡Hola, Piumigo! ♡",
  "heroTitle":"Soy Piumi",
  "heroSubtitle":"VTuber, ilustradora y creadora de pequeñas aventuras digitales.",
  "heroIntro":"Este es mi rincón para compartir streams, arte, proyectos y momentos con la comunidad.",
  "primaryCta":"Entrar al Stream",
  "secondaryCta":"Ver comisiones",
  "scheduleTitle":"Horario de streams",
  "scheduleImageUrl":"/schedule-placeholder.svg",
  "scheduleNote":"El horario puede cambiar. Revisa mis redes para avisos de último momento.",
  "aboutTitle":"Quiénes somos",
  "aboutText":"Piumi es un proyecto VTuber construido entre ilustración, streaming, programación y una comunidad que deja corazones por todas partes.",
  "teamTitle":"Detrás del proyecto",
  "teamText":"Creamos contenido, arte y herramientas para que cada directo tenga algo nuevo que descubrir.",
  "footerText":"Streams, arte y código con aroma a algodón de azúcar.",
  "footerThanks":"Gracias por ser parte de esta pequeña constelación.",
  "socials":[
    {"name":"TikTok","label":"TikTok","icon":"♪","href":"https://www.tiktok.com/"},
    {"name":"YouTube","label":"YouTube","icon":"▶","href":"https://www.youtube.com/"},
    {"name":"Instagram","label":"Instagram","icon":"◎","href":"https://www.instagram.com/"},
    {"name":"Discord","label":"Discord","icon":"◉","href":"https://discord.com/"}
  ]
}'::jsonb)
on conflict (key) do nothing;

insert into public.terms_versions (version, title, content, is_published, published_at)
values ('v1','Términos de servicio','## Términos generales

- Las comisiones se realizan por orden de pedido.
- Puedo rechazar una solicitud que no se ajuste al servicio.
- El alcance, precio y fecha se confirman antes de comenzar.

## Proceso de trabajo

- Solicitud y revisión de referencias.
- Cotización y pago acordado.
- Boceto con oportunidad de correcciones.
- Producción, detalles finales y entrega.

## Pago y reembolsos

- No se inicia la pieza final sin el pago acordado.
- Los reembolsos dependen de la etapa alcanzada y del trabajo ya realizado.

## Uso

- El uso comercial debe acordarse expresamente.
- La firma del artista no puede eliminarse.
- La publicación en portafolio puede acordarse con el cliente.', true, now())
on conflict (version) do nothing;

insert into public.price_settings (category, style, description, price, price_from, currency, sort_order)
select * from (values
  ('Icon','Sketch','Retrato compacto en boceto.',100::numeric,100::numeric,'MXN',10),
  ('Icon','Full color','Icon terminado a color.',300::numeric,300::numeric,'MXN',20),
  ('Half Body','Sketch','Personaje hasta medio cuerpo.',180::numeric,180::numeric,'MXN',30),
  ('Half Body','Full color','Medio cuerpo terminado a color.',400::numeric,400::numeric,'MXN',40),
  ('Full Body','Sketch','Personaje de cuerpo completo en boceto.',250::numeric,250::numeric,'MXN',50),
  ('Full Body','Full color','Cuerpo completo terminado a color.',500::numeric,500::numeric,'MXN',60),
  ('Animación','Loop sencillo','Movimiento corto de 3 a 5 segundos.',350::numeric,350::numeric,'MXN',70)
) as seed(category,style,description,price,price_from,currency,sort_order)
where not exists (
  select 1 from public.price_settings p where lower(p.category)=lower(seed.category) and lower(p.style)=lower(seed.style)
);

insert into public.tags (name, slug, group_name)
values
  ('Icon','icon','tipo'),('Half Body','half-body','tipo'),('Full Body','full-body','tipo'),
  ('Sketch','sketch','acabado'),('Color base','color-base','acabado'),('Full color','full-color','acabado'),
  ('Animación','animacion','tipo'),('Piumi','piumi','tema'),('VTuber','vtuber','tema')
on conflict (name) do nothing;

-- ---------- Funciones atómicas de agregación LIVE ----------
create or replace function public.increment_live_user_stats(
  p_stat_date date,
  p_user_id uuid,
  p_event_type text,
  p_quantity bigint default 0,
  p_diamonds bigint default 0,
  p_event_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.live_daily_user_stats (
    stat_date,user_id,likes,gifts,diamonds,shares,follows,subscriptions,chats,last_event_at
  ) values (
    p_stat_date,p_user_id,
    case when p_event_type='like' then p_quantity else 0 end,
    case when p_event_type='gift' then p_quantity else 0 end,
    case when p_event_type='gift' then p_diamonds else 0 end,
    case when p_event_type='share' then p_quantity else 0 end,
    case when p_event_type='follow' then p_quantity else 0 end,
    case when p_event_type='subscribe' then p_quantity else 0 end,
    case when p_event_type='chat' then p_quantity else 0 end,
    p_event_at
  )
  on conflict (stat_date,user_id) do update set
    likes = live_daily_user_stats.likes + excluded.likes,
    gifts = live_daily_user_stats.gifts + excluded.gifts,
    diamonds = live_daily_user_stats.diamonds + excluded.diamonds,
    shares = live_daily_user_stats.shares + excluded.shares,
    follows = live_daily_user_stats.follows + excluded.follows,
    subscriptions = live_daily_user_stats.subscriptions + excluded.subscriptions,
    chats = live_daily_user_stats.chats + excluded.chats,
    last_event_at = greatest(live_daily_user_stats.last_event_at, excluded.last_event_at);
end;
$$;

create or replace function public.increment_live_session(
  p_session_id uuid,
  p_event_type text,
  p_quantity bigint default 0,
  p_diamonds bigint default 0,
  p_viewers integer default null,
  p_event_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.live_sessions set
    total_likes = total_likes + case when p_event_type='like' then p_quantity else 0 end,
    total_gifts = total_gifts + case when p_event_type='gift' then p_quantity else 0 end,
    total_diamonds = total_diamonds + case when p_event_type='gift' then p_diamonds else 0 end,
    total_shares = total_shares + case when p_event_type='share' then p_quantity else 0 end,
    new_followers = new_followers + case when p_event_type='follow' then p_quantity else 0 end,
    new_subscribers = new_subscribers + case when p_event_type='subscribe' then p_quantity else 0 end,
    current_viewers = case when p_viewers is null then current_viewers else greatest(p_viewers,0) end,
    peak_viewers = case when p_viewers is null then peak_viewers else greatest(peak_viewers,p_viewers) end,
    last_event_at = p_event_at
  where id = p_session_id;
end;
$$;
