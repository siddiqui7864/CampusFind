-- =============================================
-- Findora Supabase Setup — Run this in SQL Editor
-- =============================================

-- 1. Create items table
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'lost',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT DEFAULT '',
  reporter TEXT NOT NULL,
  contact TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 3. Public access policies (anyone can read/write — fine for a campus portal)
CREATE POLICY "Public read" ON items FOR SELECT USING (true);
CREATE POLICY "Public insert" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON items FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON items FOR DELETE USING (true);

-- 4. Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- 5. Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

-- 6. Storage access policies
CREATE POLICY "Public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-images');
CREATE POLICY "Public view" ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
CREATE POLICY "Public delete storage" ON storage.objects FOR DELETE USING (bucket_id = 'item-images');

-- 7. Seed sample data
INSERT INTO items (type, name, category, location, date, description, reporter, contact) VALUES
('lost', 'Black iPhone 15 Pro', 'electronics', 'library', '2026-04-24', 'Lost my iPhone 15 Pro (black, 256GB) near the 2nd floor reading section. Has a clear case with a sticker on the back.', 'Aarav Mehta', 'aarav.m@campus.edu'),
('found', 'Silver House Keys (3 keys)', 'keys', 'cafeteria', '2026-04-24', 'Found a set of 3 silver keys on a red carabiner near the south entrance of the cafeteria.', 'Priya Sharma', 'priya.s@campus.edu'),
('lost', 'Brown Leather Wallet', 'accessories', 'auditorium', '2026-04-23', 'Lost a brown leather bifold wallet (brand: Tommy Hilfiger). Contains college ID and debit card.', 'Rohan Gupta', 'rohan.g@campus.edu'),
('found', 'Blue JBL Earbuds Case', 'electronics', 'gym', '2026-04-23', 'Found a blue JBL earbuds charging case on the bench near the treadmills. Earbuds are inside.', 'Sneha Patel', 'sneha.p@campus.edu'),
('lost', 'College ID Card — Vikram S.', 'documents', 'classroom', '2026-04-22', 'Lost my college ID card, name Vikram Srinivasan, Roll No. CS2024-087. Last seen in Room 302.', 'Vikram S.', '+91 98765 12345'),
('found', 'Black Laptop Bag (HP)', 'bags', 'parking', '2026-04-22', 'Found a black HP laptop bag near the two-wheeler parking area. Has a charger and notebook inside.', 'Ananya Iyer', 'ananya.i@campus.edu'),
('claimed', 'Ray-Ban Sunglasses', 'accessories', 'cafeteria', '2026-04-20', 'Black frame Ray-Ban sunglasses found near the vending machines. Successfully returned to owner!', 'Karan Joshi', 'karan.j@campus.edu'),
('found', 'Data Structures Textbook', 'books', 'library', '2026-04-21', 'Found a Data Structures and Algorithms in C++ textbook on the 3rd floor study table. Name inside: D. Kumar.', 'Meera Nair', 'meera.n@campus.edu'),
('lost', 'Red Hoodie (Nike)', 'clothing', 'hostel', '2026-04-21', 'Left my red Nike hoodie (size M) in the hostel common room. Has my initials RK on the tag.', 'Ravi Kumar', '+91 91234 56789'),
('found', 'Steel Water Bottle (750ml)', 'bags', 'lab', '2026-04-22', 'Found a steel water bottle with floral stickers in Computer Lab 2. Left on the desk near Window 3.', 'Tanya Reddy', 'tanya.r@campus.edu'),
('lost', 'USB Drive (32GB SanDisk)', 'electronics', 'lab', '2026-04-23', 'Lost a red 32GB SanDisk USB drive in Computer Lab 1. Contains important project files.', 'Arjun Nair', 'arjun.n@campus.edu'),
('found', 'Prescription Glasses', 'accessories', 'classroom', '2026-04-24', 'Found a pair of black-framed prescription glasses in Room 205 after the morning lecture.', 'Divya Rao', 'divya.r@campus.edu');
