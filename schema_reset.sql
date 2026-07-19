-- ═══════════════════════════════════════════════════════════════
-- ZALAVRAI SYSTÈME — RÉINITIALISATION COMPLÈTE du schéma Supabase
--
-- ⚠️⚠️⚠️  ATTENTION — SCRIPT DESTRUCTEUR  ⚠️⚠️⚠️
-- Ce script SUPPRIME les 6 tables existantes (utilisateurs, clients,
-- ventes, paiements, stock, signalements) ET TOUTES LEURS DONNÉES,
-- puis les recrée vides avec la structure actuelle attendue par
-- l'app. Toute donnée déjà présente dans Supabase sera perdue
-- définitivement (clients, ventes, paiements, historique...).
--
-- Avant d'exécuter :
--   1. Si vous voulez garder une trace des données actuelles,
--      exportez-les d'abord (Supabase → Table Editor → chaque table
--      → ⋮ → "Export data as CSV"), ou utilisez les exports CSV déjà
--      présents dans l'app (Réglages / Rapports).
--   2. Vérifiez que vous êtes bien sur le bon projet Supabase avant
--      de lancer ceci (URL du projet visible dans Réglages → Admin).
--
-- À exécuter : Supabase → SQL Editor → New Query → coller ce fichier
-- en entier → Run.
-- ═══════════════════════════════════════════════════════════════

drop table if exists utilisateurs cascade;
drop table if exists clients      cascade;
drop table if exists ventes       cascade;
drop table if exists paiements    cascade;
drop table if exists stock        cascade;
drop table if exists signalements cascade;

-- ─── Recréation (structure identique à schema.sql, à jour au 19/07/2026) ───

create table utilisateurs (
  id                text primary key,
  username          text unique not null,
  password          text not null,
  role              text not null,
  manager_username  text,
  actif             boolean default true,
  photo             text,
  date_creation     text
);

create table clients (
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
  vente_bloquee     boolean default false,
  carte_num         integer
);

create table ventes (
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

create table paiements (
  id                text primary key,
  vente_id          text,
  agent_username    text,
  montant_paye      numeric,
  date_paiement     text,
  date_creation     text,
  note              text
);

create table stock (
  id                text primary key,
  source_username   text,
  dest_username     text,
  produit           text,
  quantite          numeric,
  prix_unitaire     numeric default 0,
  date_mouvement    text
);

create table signalements (
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
-- L'app n'utilise pas Supabase Auth : tous les rôles se connectent
-- avec la même clé "anon" et le contrôle des permissions est fait
-- côté app (JS). Cette politique autorise donc tout accès via cette
-- clé, comme dans schema.sql d'origine.
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
-- Le bucket de stockage "zalavrai-photos" (Storage) n'est PAS touché
-- par ce script — les photos déjà uploadées restent intactes. S'il
-- n'existe pas encore : Supabase → Storage → New bucket → nom exact
-- "zalavrai-photos" → cocher "Public bucket" → Create.
