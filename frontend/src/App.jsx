// App.jsx — Root application component with routing
// Step 6: Full routing and AuthProvider wrapping
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App