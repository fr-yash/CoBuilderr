import AppRoutes from './routes/AppRoutes.jsx'
import { UserProvider } from './context/user.context.jsx'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <UserProvider>
      <div className='w-full h-screen font-sans'>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
            border: '1px solid #374151'
          }
        }} />
        <AppRoutes />
      </div>
    </UserProvider>
  )
}

export default App
