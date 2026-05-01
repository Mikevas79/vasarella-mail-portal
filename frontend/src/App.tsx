import { useEffect } from 'react'
import './index.css'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { UserProfile } from './components/UserProfile'
import { ChangePasswordForm } from './components/ChangePasswordForm'
import { AdminPanel } from './components/AdminPanel'
import { SetupInstructions } from './components/SetupInstructions'

function App() {
  const { user, loading, error, requires2fa, login, verify2fa, logout, checkAuth } = useAuth()

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

		 <div id="setup-instructions">
    		<SetupInstructions />
  		</div>
        </>
      ) : (
        <LoginForm
          onLogin={login}
          onVerify2fa={verify2fa}
          requires2fa={requires2fa}
          loading={loading}
          error={error}
        />
      )}
    </div>
  )
}

export default App
