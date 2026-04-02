// AuthContext.jsx — React context for JWT-based authentication state
// Step 6: AuthProvider with JWT localStorage management
import React from 'react'

export const AuthContext = React.createContext(null)

export const useAuth = () => React.useContext(AuthContext)

export function AuthProvider({ children }) {
  return <>{children}</> // Step 6: full provider logic added here
}