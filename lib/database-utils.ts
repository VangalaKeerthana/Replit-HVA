import { supabase } from "./supabase"

export async function ensureTableExists() {
  try {
    // Try to create the table if it doesn't exist
    const { error } = await supabase.rpc("create_hva_table_if_not_exists")

    if (error) {
      console.log("RPC function not available, table may need manual creation")
      return false
    }

    return true
  } catch (error) {
    console.log("Could not ensure table exists:", error)
    return false
  }
}

export async function checkTableExists() {
  try {
    const { error } = await supabase.from("hva_assessments").select("id").limit(1)

    return !error || !error.message.includes("does not exist")
  } catch (error) {
    return false
  }
}
