// app/account/actions.js
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from './server';
import { supabaseAdmin } from './supabaseAdmin';

export async function deleteUserAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Redirect to login if no user is found
        redirect('/');
    }

    const { data: userDeleteData, error: userError } = await supabase.from('users').delete().eq('id', user.id);
    console.log("🔍 ~ deleteUserAccount ~ lib/supabase/deleteUser.ts:26 ~ userDeleteData: now user deleted", userDeleteData);
    if (userError) {
        console.error('Error deleting user:', userError);
        // Handle error, maybe return a message to the client
        return { error: 'Failed to delete account' };
    }

    // Use the admin client with the service_role key to delete the user
    const { data: userData, error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    console.log("🔍 ~ deleteUserAccount ~ lib/supabase/deleteUser.ts:18 ~ userData: now authenticated user deleted", userData);

    if (error) {
        console.error('Error deleting user authentication:', error.message);
        // Handle error, maybe return a message to the client
        return { error: 'Failed to delete account' };
    }

    // Sign the user out from their current session after the account is deleted
    await supabase.auth.signOut();

    // Revalidate any cached data and redirect the user
    revalidatePath('/');
    redirect('/');
}
