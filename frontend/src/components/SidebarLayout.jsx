import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import axios from 'axios'
import logo from '../assets/logo-fapg.svg'

// Ícones do menu
import {
  Users,
  User,
  FolderKanban,
  ListTodo,
  CheckSquare,
  Banknote,
  FileText
} from 'lucide-react'

export default function SidebarLayout() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
      } catch (err) {
        console.error('Erro ao carregar dados do usuário logado:', err)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-green-700 text-white flex flex-col">
        <div className="flex items-center gap-0 mb-6">
          <img src={logo} alt="Logo FAPG" className="w-24 h-24" />
          <span className="p-4 text-xl font-bold border-b border-green-600">Painel Projetos</span>
        </div>

        {user && (
          <div className="bg-green-600/50 m-3 p-4 rounded-lg shadow text-sm text-white space-y-2 border-b border-green-600">
            <p className="font-bold text-white text-base">{user.name}</p>
            <p className="text-white">{user.email}</p>
            <p className="text-white">( {user.system_role} )</p>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/teams" className="flex items-center gap-2 hover:bg-green-600 p-2 rounded">
            <Users className="w-5 h-5" /> <span>Times</span>
          </Link>
          <Link to="/users" className="flex items-center gap-2 hover:bg-green-600 p-2 rounded">
            <User className="w-5 h-5" /> <span>Usuários</span>
          </Link>
          <Link to="/projects" className="flex items-center gap-2 hover:bg-green-600 p-2 rounded">
            <FolderKanban className="w-5 h-5" /> <span>Projetos</span>
          </Link>
          <Link to="/activities" className="flex items-center gap-2 hover:bg-green-600 p-2 rounded">
            <ListTodo className="w-5 h-5" /> <span>Atividades</span>
          </Link>
          <Link to="/tasks" className="flex items-center gap-2 hover:bg-green-600 p-2 rounded">
            <CheckSquare className="w-5 h-5" /> <span>Tarefas</span>
          </Link>
          <Link to="/agencies" className="flex items-center gap-2 hover:bg-green-600 p-2 rounded">
            <Banknote className="w-5 h-5" /> <span>Agências</span>
          </Link>
          <Link to="/documents" className="flex items-center gap-2 hover:bg-green-600 p-2 rounded">
            <FileText className="w-5 h-5" /> <span>Documentos</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-green-600">
          <button
            onClick={() => {
              localStorage.removeItem('token')
              window.location.href = '/'
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white w-full"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
