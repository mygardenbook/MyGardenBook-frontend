// public/js/config.js

// 🌱 Central Environment Variables
window.__ENV = {
  API_BASE: "https://mygardenbook-backend.onrender.com",

  // Supabase project details
  SUPABASE_URL: "https://ctoqycjzmfvdvgnirlkp.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0b3F5Y2p6bWZ2ZHZnbmlybGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDUyOTIsImV4cCI6MjA3OTkyMTI5Mn0.Gd3gHxbypxTKpyweLFwQvriIeX2lF1QTTRSMDfpXbqI",

  // Optional
  CLOUDINARY_URL: "cloudinary://498356955634788:FmXpqXthmrDXkwb3uG23SteM2Mk@dqoswpdgt"
};

// ⚠️ DO NOT create a Supabase client here.
// Login.js will create the client using window.__ENV values.
// This prevents double-client issues and 400 Bad Request errors.
