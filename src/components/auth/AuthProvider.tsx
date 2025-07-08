"use client"

import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { GuestForm } from "./GuestForm"
import { RegisterForm } from "./RegisterForm"

type AuthMode = "login" | "register" | "guest"

interface AuthProviderProps {
  defaultMode?: AuthMode
  onSuccess?: () => void
}

export function AuthProvider({ defaultMode = "login", onSuccess }: AuthProviderProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode)

  return (
    <div className="w-full max-w-md mx-auto">
      {mode === "login" && (
        <LoginForm
          onSwitchToGuest={() => setMode("guest")}
          onSwitchToRegister={() => setMode("register")}
        />
      )}
      
      {mode === "register" && (
        <RegisterForm
          onSwitchToLogin={() => setMode("login")}
          onSwitchToGuest={() => setMode("guest")}
        />
      )}
      
      {mode === "guest" && (
        <GuestForm
          onSwitchToLogin={() => setMode("login")}
          onSuccess={onSuccess}
        />
      )}
    </div>
  )
}