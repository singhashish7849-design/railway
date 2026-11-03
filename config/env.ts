export const env = {
  // RailRadar — server-side only
  RAILRADAR_API_KEY: process.env.RAILRADAR_API_KEY || 'rg_985c53ae131249e2a52c45c4c72986bf',
  RAILRADAR_BASE_URL: 'https://api.railradar.in/v1',

  // RailKit — server-side only
  RAILKIT_API_KEY: process.env.RAILKIT_API_KEY || process.env.railkit_7d79f471a5ffa1f063c68949506ce4ac1f540f188def3f0d || 'railkit_7d79f471a5ffa1f063c68949506ce4ac1f540f188def3f0d',

  // MapTiler — public (safe to expose)
  MAPTILER_API_KEY: process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'mHe3By10VncPGKzMpJ0V',

  // OpenWeather — server-side only
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '80b683434abdbecbe3b2027d6f463794',

  // OpenTopography — server-side only
  OPENTOPOGRAPHY_API_KEY: process.env.OPENTOPOGRAPHY_API_KEY || '7690e1e588eadb7540ca17e80423aef4',

  // iRail Belgium — server-side only
  IRAIL_BASE_URL: process.env.IRAIL_BASE_URL || 'https://api.irail.be',

  // Upstash Redis (Phase 2)
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',

  // Application Base URL
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// Client-safe config — only include NEXT_PUBLIC_ variables here
export const clientEnv = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  MAPTILER_API_KEY: process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'mHe3By10VncPGKzMpJ0V',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jlqvfjzoutyadmvufqvp.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_aeMs35GHoNbimX6Ncb07BQ_xhl7HQKv',
};
