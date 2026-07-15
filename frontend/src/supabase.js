import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpwxfaxcgfybajqoalsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwd3hmYXhjZ2Z5YmFqcW9hbHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTI0NzYsImV4cCI6MjA5OTY2ODQ3Nn0.z2L47BGbwXh325efuoyeqo4LdTShS1PXLhY7MATVDrE';

export const supabase = createClient(supabaseUrl, supabaseKey);