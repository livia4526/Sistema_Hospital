import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProvedorDeLogin } from './auth/ProvedorDeLogin'
import { useLogin } from './auth/useLogin'
import { Login } from './pages/Login'
import { Painel } from './pages/Painel'

// Só deixa ver a página quem está logado; os outros vão para o login
function Protegida({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useLogin()
  if (carregando) return null
  return usuario ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ProvedorDeLogin>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protegida><Painel /></Protegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorDeLogin>
  )
}
