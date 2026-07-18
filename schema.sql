-- ═══════════════════════════════════════════════════════════════
-- ZALAVRAI SYSTÈME — Schéma Supabase
-- À coller dans Supabase → SQL Editor → New Query → Run
-- Crée les 6 tables utilisées par la synchronisation cloud de l'app.
--
-- Note sur les types : les colonnes de date sont en `text` (et non
-- `date`/`timestamp`) car l'app envoie tantôt une date simple
-- (YYYY-MM-DD), tantôt un horodatage ISO complet selon l'écran —
-- un type strict ferait échouer silencieusement la synchronisation
-- sur certains enregistrements.
-- ═══════════════════════════════════════════════════════════════

create table if not exists utilisateurs (
  id                text primary key,
  username          text unique not null,
  password          text not null,
  role              text not null,
  manager_username  text,
  actif             boolean default true,
  photo             text,
  date_creation     text
);

create table if not exists clients (
  id                text primary key,
  nom_complet       text not null,
  agent_username    text,
  photo             text,
  lieu_activite     text,
  activite          text,
  telephone         text,
  cin               text,
  genre             text,
  actif             boolean default true,
  actif_depuis      text,
  date_creation     text,
  carte_creee       text default 'Non',
  flag_manuel       text,
  note_interne      text,
  vente_bloquee     boolean default false
);

create table if not exists ventes (
  id                  text primary key,
  agent_username      text,
  vendu_par           text,
  client_id           text,
  produit             text,
  montant_total       numeric,
  acompte30           numeric,
  solde70             numeric,
  montant_journalier  numeric,
  duree_jours         integer default 30,
  date_debut          text,
  date_fin            text,
  date_creation       text,
  note                text
);

create table if not exists paiements (
  id                text primary key,
  vente_id          text,
  agent_username    text,
  montant_paye      numeric,
  date_paiement     text,
  date_creation     text,
  note              text
);

create table if not exists stock (
  id                text primary key,
  source_username   text,
  dest_username     text,
  produit           text,
  quantite          numeric,
  prix_unitaire     numeric default 0,
  date_mouvement    text
);

create table if not exists signalements (
  id                text primary key,
  type              text,
  ref_id            text,
  reporter          text,
  description       text,
  statut            text default 'attente',
  date_creation     text,
  date_resolution   text
);

-- ═══ Row Level Security ═══
-- L'app n'utilise pas Supabase Auth : tous les rôles (Admin, Manager,
-- Agent, CréateurCarte) se connectent avec la même clé "anon" et le
-- contrôle des permissions est fait uniquement côté app (JS). La
-- politique ci-dessous autorise donc tout accès via la clé anon.
--
-- ⚠️ Concrètement, quiconque récupère cette clé anon (visible dans
-- les réglages de l'app côté client) peut lire/modifier/supprimer
-- toutes les données de tous les utilisateurs via l'API REST. Pour
-- une vraie séparation des permissions par rôle, il faudrait migrer
-- vers Supabase Auth + des policies RLS par rôle — hors du périmètre
-- de ce script, qui ne fait que rendre l'app fonctionnelle telle
-- qu'elle est conçue aujourd'hui.
do $$ declare t text;
begin
  for t in values
    ('utilisateurs'),('clients'),('ventes'),
    ('paiements'),('stock'),('signalements')
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "allow_all" on %I', t);
    execute format('create policy "allow_all" on %I for all using (true) with check (true)', t);
  end loop;
end $$;

-- ═══ Étape suivante (hors SQL) ═══
-- Dans Supabase → Storage → New bucket → nom exact "zalavrai-photos"
-- → cocher "Public bucket" → Create. Sert au stockage des photos
-- clients/profils uploadées depuis l'app.
