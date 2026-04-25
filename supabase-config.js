// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://pnzxhgkyhtzmrghfijmi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuenhoZ2t5aHR6bXJnaGZpam1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjQzODIsImV4cCI6MjA5MjcwMDM4Mn0.L23jafqcQYfD_RSenxd8FkZm3aEn9aLCc-r4GG7k1Gk';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
