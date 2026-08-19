// ============================================================
// SUPABASE - Autenticacion compartida para todos los dispositivos
// ============================================================
const SUPABASE_URL = 'https://tjdpzzrrnexdfvkczkyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Q1LDKb7ucck7isJyXES83A_AI2yZVy9';
const SUPABASE_CLIENT = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

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
    if(profileResult.error && profileResult.error.code !== '42P01') throw profileResult.error;
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
  if(profileResult.error && profileResult.error.code !== '42P01') throw profileResult.error;
  return {user, profile: profileResult.data || profile || {email:user.email, username:identifier}};
}
