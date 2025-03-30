import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SidebarLayout from './components/SidebarLayout'

import TeamsListPage from './pages/TeamsListPage'
import TeamsCreatePage from './pages/TeamsCreatePage'
import TeamsEditPage from './pages/TeamsEditPage'
import TeamsViewPage from './pages/TeamsViewPage'

import UsersListPage from './pages/UsersListPage'
import UsersCreatePage from './pages/UsersCreatePage'
import UsersEditPage from './pages/UsersEditPage'
import UsersViewPage from './pages/UsersViewPage'

import ProjectsListPage from './pages/ProjectsListPage'
import ProjectsCreatePage from './pages/ProjectsCreatePage'
import ProjectsEditPage from './pages/ProjectsEditPage'
import ProjectsViewPage from './pages/ProjectsViewPage'

import AgenciesListPage from './pages/AgenciesListPage'
import AgenciesCreatePage from './pages/AgenciesCreatePage'
import AgenciesEditPage from './pages/AgenciesEditPage'
import AgenciesViewPage from './pages/AgenciesViewPage'

import ActivitiesListPage from './pages/ActivitiesListPage'
import ActivitiesCreatePage from './pages/ActivitiesCreatePage'
import ActivitiesEditPage from './pages/ActivitiesEditPage'
import ActivitiesViewPage from './pages/ActivitiesViewPage'

import TasksListPage from './pages/TasksListPage'
import TasksCreatePage from './pages/TasksCreatePage'
import TasksEditPage from './pages/TasksEditPage'
import TasksViewPage from './pages/TasksViewPage'

import DocumentsListPage from './pages/DocumentsListPage'
import DocumentsUploadPage from './pages/DocumentsUploadPage'
import DocumentsEditPage from './pages/DocumentsEditPaga'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <SidebarLayout />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<HomePage />} />

          <Route path="teams/:id/view" element={<TeamsViewPage />} />
          <Route path="teams/:id/edit" element={<TeamsEditPage />} />
          <Route path="teams/create" element={<TeamsCreatePage />} />
          <Route path="teams" element={<TeamsListPage />} />

          <Route path="users/:id/view" element={<UsersViewPage />} />
          <Route path="users/:id/edit" element={<UsersEditPage />} />
          <Route path="users/create" element={<UsersCreatePage />} />
          <Route path="users" element={<UsersListPage />} />

          <Route path="projects/:id/view" element={<ProjectsViewPage />} />
          <Route path="projects/:id/edit" element={<ProjectsEditPage />} />
          <Route path="projects/create" element={<ProjectsCreatePage />} />
          <Route path="projects" element={<ProjectsListPage />} />          
          
          <Route path="agencies/:id/view" element={<AgenciesViewPage />} />
          <Route path="agencies/:id/edit" element={<AgenciesEditPage />} />
          <Route path="agencies/create" element={<AgenciesCreatePage />} />
          <Route path="agencies" element={<AgenciesListPage />} />   

          <Route path="activities/:id/view" element={<ActivitiesViewPage />} />
          <Route path="activities/:id/edit" element={<ActivitiesEditPage />} />
          <Route path="activities/create" element={<ActivitiesCreatePage />} />
          <Route path="activities" element={<ActivitiesListPage />} />

          <Route path="tasks/:id/view" element={<TasksViewPage />} />
          <Route path="tasks/:id/edit" element={<TasksEditPage />} />
          <Route path="tasks/create" element={<TasksCreatePage />} />
          <Route path="tasks" element={<TasksListPage />} />

          <Route path="documents/:id/edit" element={<DocumentsEditPage />} />
          <Route path="documents/upload" element={<DocumentsUploadPage />} />
          <Route path="documents" element={<DocumentsListPage />} />

        </Route>
      </Routes>
    </Router>
  )
}
