'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    // Update last_login_at and get user role
    const { data: { user } } = await supabase.auth.getUser()
    let userRole = 'staff'

    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id)
            .select('role')
            .single()

        userRole = userData?.role || 'staff'
    }

    revalidatePath('/', 'layout')

    // Staff default landing = /frontdesk
    if (userRole === 'staff') {
        redirect('/frontdesk')
    }
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()

    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/login')
}
