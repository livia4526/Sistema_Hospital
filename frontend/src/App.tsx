import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProvedorDeLogin } from './auth/ProvedorDeLogin'
import { useLogin } from './auth/useLogin'
import { Agendar } from './pages/Agendar'
import { BuscarPacientes } from './pages/BuscarPacientes'
import { Configuracoes } from './pages/Configuracoes'
import { FichaPaciente } from './pages/FichaPaciente'
import { Login } from './pages/Login'
import { NovoPaciente } from './pages/NovoPaciente'
import { Painel } from './pages/Painel'
import { Perfil } from './pages/Perfil'

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
          <Route path="/pacientes" element={<Protegida><BuscarPacientes /></Protegida>} />
          <Route path="/pacientes/novo" element={<Protegida><NovoPaciente /></Protegida>} />
          <Route path="/pacientes/:id" element={<Protegida><FichaPaciente /></Protegida>} />
          <Route path="/agendar/:tipo" element={<Protegida><Agendar /></Protegida>} />
          <Route path="/perfil" element={<Protegida><Perfil /></Protegida>} />
          <Route path="/configuracoes" element={<Protegida><Configuracoes /></Protegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorDeLogin>
  )
}
