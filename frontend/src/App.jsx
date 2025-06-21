import AppRoutes from './routes/AppRoutes.jsx'
import { UserProvider } from './context/user.context.jsx'

const App = () => {
  return (
    <UserProvider>
      <div className='w-full h-screen'>
        <AppRoutes />
      </div>
    </UserProvider>
  )
}

export default App
