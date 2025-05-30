import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import api from '../services/api'
import logo from '../assets/logo-fapg.svg'
import perfil from '../assets/perfil.png'

// Ícones do menu
import {
  Users,
  User,
  FolderKanban,
  ListTodo,
  CheckSquare,
  Banknote,
  Compass,
  FileText,
  School
} from 'lucide-react'

export default function SidebarLayout() {

  const [user, setUser] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/auth/me`)
        setUser(response.data)
      } catch (err) {
        console.error('Erro ao carregar dados do usuário logado:', err)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {

    let imageUrl

    const fetchPhoto = async () => {
      try {
        const response = await api.get(`/userphotos/${user.id}/view`, {
          responseType: 'blob'
        })
  
        if (response?.status === 204) {
          // Foto não encontrada (usuário não tem foto)
          setPhotoUrl(perfil)
        } else {
          imageUrl = URL.createObjectURL(response.data)
          setPhotoUrl(imageUrl)
        }
      } catch (err) {
        setError('Erro inesperado ao carregar foto de perfil.')
      }
    }
  
    if (user && user.id) fetchPhoto()

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }

  }, [user])

  const allPaths = [
    { name: "Times", icon: Users, endpoint: "/teams" },
    { name: "Usuários", icon: User, endpoint: "/users" },
    { name: "Projetos", icon: FolderKanban, endpoint: "/projects" },
    { name: "Instituições", icon: School, endpoint: "/institutions" },
    { name: "Agências", icon: Banknote, endpoint: "/agencies" },
    { name: "Áreas", icon: Compass, endpoint: "/areas" },
    { name: "Documentos", icon: FileText, endpoint: "/documents" },
  ];

  const adminAvailablePaths = ["all"];
  const userAvailablePaths = ["Projetos"];

  const getPathsByName = (pathNamesArray) => {
    if (pathNamesArray[0] === "all") return allPaths;

    return allPaths.filter((path) => pathNamesArray.includes(path.name));
  };

  const availablePathsByRole = {
    "Super Admin": getPathsByName(adminAvailablePaths),
    "Admin": getPathsByName(adminAvailablePaths),
    "User": getPathsByName(userAvailablePaths),
    "Viewer": getPathsByName(userAvailablePaths),
  };
  
  return (
      <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-green-700 text-white flex flex-col">
        <Link to="/home" >
          <div className="flex items-center gap-0 mb-6">
            <img src={logo} alt="Logo FAPG" className="w-24 h-24" />
            <span className="p-4 text-xl font-bold border-b border-green-600">Painel Projetos</span>
          </div>
        </Link>
        {user && (
          <div className="bg-green-600/50 m-3 p-4 rounded-lg shadow text-sm text-white border-b border-green-600 flex flex-col items-center">
            <Link to="/profile" >
              <img
                src={photoUrl || perfil}
                alt="Foto de perfil"
                className="w-20 h-20 rounded-full border-2 border-white object-cover mb-3"
              />
            </Link>
            <p className="font-bold text-white text-base text-center">{user.name}</p>
            <p className="text-white text-center">{user.email}</p>
            <p className="text-white text-center">( {user.system_role} )</p>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2">
          {user && availablePathsByRole[user.system_role].map(path => { 
            const Icon = path.icon;
            
            return(
              <Link to={path.endpoint} key={path.name} className="flex items-center gap-2 hover:bg-green-600 p-2 rounded">
                <Icon className="w-5 h-5" /> <span>{path.name}</span>
              </Link>
            );
          })}
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
