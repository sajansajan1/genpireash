"use server"

// Mock auth functions that always succeed
export async function login(formData: FormData): Promise<{ error?: { message: string }; success?: boolean }> {
  console.log("Mock login called with:", formData.get("email"))
  return { success: true }
}

export async function register(formData: FormData): Promise<{ error?: { message: string }; success?: boolean }> {
  console.log("Mock register called with:", formData.get("email"), formData.get("name"))
  return { success: true }
}

export async function logout() {
  console.log("Mock logout called")
  return { success: true }
}

export async function getCurrentUser() {
  // Return a mock user
  return {
    id: "mock-user-id",
    email: "dev@example.com",
    user_metadata: {
      full_name: "Development User",
    },
  }
}
