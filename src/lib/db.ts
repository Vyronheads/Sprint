import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const saveUser = async (user: { username: string; email: string; password: string }) => {
  const { data, error } = await supabase
    .from('users')
    .insert([user]);

  if (error) {
    throw error;
  }

  return data;
};

const getUser = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export { saveUser, getUser };