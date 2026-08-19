// ============================================================
// SUPABASE - Autenticacion compartida para todos los dispositivos
// ============================================================
const SUPABASE_URL = 'https://tjdpzzrrnexdfvkczkyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Q1LDKb7ucck7isJyXES83A_AI2yZVy9';
const SUPABASE_CLIENT = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

function isMissingProfilesTable(error){
  return Boolean(error && ['42P01','PGRST205'].includes(error.code));
}

function isSupabaseConfigured(){
  return Boolean(SUPABASE_CLIENT);
}

async function signInWithSharedAccount(identifier, password){
  if(!SUPABASE_CLIENT) return null;
  const value = (identifier || '').trim();
  let email = value;
  let profile = null;
  if(!value.includes('@')){
    const profileResult = await SUPABASE_CLIENT
      .from('profiles')
      .select('email,username,full_name,role,site,sections')
      .eq('username', value.toLowerCase())
      .maybeSingle();
    if(profileResult.error && !isMissingProfilesTable(profileResult.error)) throw profileResult.error;
    profile = profileResult.data || null;
    email = profile?.email || '';
  }
  if(!email) return null;
  const result = await SUPABASE_CLIENT.auth.signInWithPassword({email, password});
  if(result.error) throw result.error;
  const user = result.data.user;
  const profileResult = await SUPABASE_CLIENT
    .from('profiles')
    .select('email,username,full_name,role,site,sections')
    .eq('id', user.id)
    .maybeSingle();
  if(profileResult.error && !isMissingProfilesTable(profileResult.error)) throw profileResult.error;
  return {user, profile: profileResult.data || profile || {email:user.email, username:identifier}};
}

async function loadSharedEarthRangerSites(){
  if(!SUPABASE_CLIENT) return [];
  const result = await SUPABASE_CLIENT
    .from('earthranger_sites')
    .select('id,name,external_id,url,token,regional,days')
    .order('name');
  if(result.error){
    if(['42P01','PGRST205'].includes(result.error.code)) return [];
    throw result.error;
  }
  return result.data || [];
}

async function upsertSharedEarthRangerSite(site){
  if(!SUPABASE_CLIENT) return null;
  const payload = {
    ...(site.id && !String(site.id).startsWith('site-') ? {id:site.id} : {}),
    name: site.name,
    external_id: site.externalId || null,
    url: site.url,
    token: site.token,
    regional: site.regional || site.name || null,
    days: Number(site.days) || 30,
    updated_at: new Date().toISOString()
  };
  const result = await SUPABASE_CLIENT.from('earthranger_sites').upsert(payload, {onConflict:'name'}).select().single();
  if(result.error) throw result.error;
  return result.data;
}

async function updateSharedProfileByEmail(profile){
  if(!SUPABASE_CLIENT || !profile?.email) return null;
  const result = await SUPABASE_CLIENT
    .from('profiles')
    .update({username:profile.username || null, full_name:profile.fullName || '', role:profile.role || 'cliente', site:profile.site || 'todas', sections:profile.sections || ['environmental']})
    .eq('email', profile.email)
    .select()
    .maybeSingle();
  if(result.error && !isMissingProfilesTable(result.error)) throw result.error;
  return result.data || null;
}
