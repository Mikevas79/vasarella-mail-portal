import { useEffect } from 'react'
import './index.css'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { UserProfile } from './components/UserProfile'
import { ChangePasswordForm } from './components/ChangePasswordForm'
import { AdminPanel } from './components/AdminPanel'

function App() {
  const { user, loading, error, login, logout, checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading && !user) {
    return <div className="container"><p>Loading...</p></div>
  }

  return (
    <div className="container">
      {user ? (
        <>
          <UserProfile user={user} onLogout={logout} loading={loading} />
          {user.isAdmin && <AdminPanel />}
          <ChangePasswordForm user={user} />
        </>
      ) : (
        <LoginForm onLogin={login} loading={loading} error={error} />
      )}
    </div>
  )
}

export default App