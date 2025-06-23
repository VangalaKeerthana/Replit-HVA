import { supabase } from "./supabase"

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (data.user) {
    // Store user ID in localStorage
    localStorage.setItem("user_id", data.user.id)
    sessionStorage.setItem("user_id", data.user.id)
  }

  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  // Clear stored user ID
  localStorage.removeItem("user_id")
  sessionStorage.removeItem("user_id")

  return { error }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getStoredUserId = () => {
  return localStorage.getItem("user_id") || sessionStorage.getItem("user_id")
}
