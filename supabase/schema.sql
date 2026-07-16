-- ConcoursMaroc Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concours (competitions) table
CREATE TABLE concours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  institution TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT,
  year INTEGER NOT NULL,
  deadline DATE,
  concours_date DATE,
  eligibility_ar TEXT,
  eligibility_fr TEXT,
  diploma_required_ar TEXT,
  diploma_required_fr TEXT,
  official_pdf_url TEXT,
  source_url TEXT,
  postes_count INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (PDFs) table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  concours_id UUID REFERENCES concours(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  subject TEXT,
  year INTEGER,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Previous exams (Annales) table
CREATE TABLE annales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  institution TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  year INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  correction_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_fr TEXT NOT NULL,
  excerpt_ar TEXT,
  excerpt_fr TEXT,
  category TEXT,
  featured_image_url TEXT,
  author_name TEXT DEFAULT 'ConcoursMaroc',
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'ar',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_concours_category ON concours(category);
CREATE INDEX idx_concours_year ON concours(year);
CREATE INDEX idx_concours_institution ON concours(institution);
CREATE INDEX idx_concours_is_active ON concours(is_active);
CREATE INDEX idx_concours_created_at ON concours(created_at DESC);

CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_file_type ON documents(file_type);
CREATE INDEX idx_documents_concours_id ON documents(concours_id);

CREATE INDEX idx_annales_institution ON annales(institution);
CREATE INDEX idx_annales_category ON annales(category);
CREATE INDEX idx_annales_year ON annales(year);

CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_category ON articles(category);

-- Full-text search indexes
CREATE INDEX idx_concours_search ON concours
  USING GIN (to_tsvector('simple', title_ar || ' ' || title_fr || ' ' || institution));

CREATE INDEX idx_documents_search ON documents
  USING GIN (to_tsvector('simple', title_ar || ' ' || title_fr));

CREATE INDEX idx_annales_search ON annales
  USING GIN (to_tsvector('simple', title_ar || ' ' || title_fr || ' ' || subject));

-- Seed categories
INSERT INTO categories (slug, name_ar, name_fr, icon, sort_order) VALUES
('master', 'ماستر', 'Master', 'GraduationCap', 1),
('licence', 'ليسانس', 'Licence Professionnelle', 'BookOpen', 2),
('doctorat', 'دكتوراه', 'Doctorat', 'Award', 3),
('ensa', 'المدرسة الوطنية للعلوم التطبيقية', 'ENSA', 'Building', 4),
('ensam', 'المدرسة الوطنية للعلوم التطبيقية - المدارس المحمدية', 'ENSAM', 'Wrench', 5),
('encg', 'المدرسة الوطنية للتجارة والتسيير', 'ENCG', 'TrendingUp', 6),
('fst', 'كلية العلوم والتقنيات', 'FST', 'Atom', 7),
('est', 'المدرسة العليا للتكنولوجيا', 'EST', 'Cpu', 8),
('ens', 'المدرسة العليا للأساتذة', 'ENS', 'GraduationCap', 9),
('ena', 'المدرسة الوطنية للإدارة', 'ENA', 'Landmark', 10),
('medecine', 'طب', 'Médecine', 'Heart', 11),
('pharmacie', 'صيدلة', 'Pharmacie', 'Pill', 12),
('architecture', 'عمارة', 'Architecture', 'Home', 13),
('ingenieur', 'المدارس الهندسية', 'Ecoles d Ingenieurs', 'Settings', 14),
('education', 'تعليم', 'Education', 'School', 15),
('primaire', 'تعليم ابتدائي', 'Enseignant Primaire', 'BookOpen', 16),
('secondaire', 'تعليم ثانوي', 'Enseignant Secondaire', 'BookOpen', 17),
('lycee', 'تعليم تأهيلي', 'Enseignant Lycee', 'BookOpen', 18),
('recrutement', 'توظيف عمومي', 'Recrutement Public', 'Users', 19),
('bourses', 'منح', 'Bourses', 'Gift', 20),
('formation', 'تكوين', 'Formation', 'Training', 21);
