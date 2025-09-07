'use server'

import {createClient} from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Provider } from '@supabase/supabase-js';

const signInWith = (provider : Provider) => async () => {
    const supabase = await createClient()

    const auth_callback_url = `${process.env.SITE_URL}/auth/callback`

    const {data, error} =

    await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: auth_callback_url
        },
    })

    console.log(data);

    if(error){
        console.log(error);
    }
    redirect(data.url ? data.url : "null")
}   

const signinWithGoogle = signInWith('google');

export { signinWithGoogle }