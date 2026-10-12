// Configuración pública de Supabase para SUNDBLOOM. Nunca pongas aquí claves secret/service_role.
const SUPABASE_URL = "https://iqspbhwvlybjmdzhctnc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__VW4vBrujm19AhVukH6mdg_K5QzTbt4";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
