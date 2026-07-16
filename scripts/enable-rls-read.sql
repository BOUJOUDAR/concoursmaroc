-- Enable public read access for all tables
-- Run this in Supabase SQL Editor

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE concours ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE annales ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view concours" ON concours FOR SELECT USING (true);
CREATE POLICY "Public can view documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public can view annales" ON annales FOR SELECT USING (true);
CREATE POLICY "Public can view articles" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public can subscribe newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Allow anon insert for newsletter
CREATE POLICY "Anon can insert newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
