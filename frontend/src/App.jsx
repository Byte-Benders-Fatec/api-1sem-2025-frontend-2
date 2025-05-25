import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'

import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SidebarLayout from './components/SidebarLayout'
import ChatbotAssistant from './components/ChatbotAssistent'
import UserProfilePage from './pages/UserProfilePage'

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

import ProjectActivitiesListPage from './pages/ProjectActivitiesListPage'
import ProjectActivityCreatePage from './pages/ProjectActivityCreatePage'

import ProjectDocumentsListPage from './pages/ProjectDocumentsListPage'

import AgenciesListPage from './pages/AgenciesListPage'
import AgenciesCreatePage from './pages/AgenciesCreatePage'
import AgenciesEditPage from './pages/AgenciesEditPage'
import AgenciesViewPage from './pages/AgenciesViewPage'

import ActivitiesListPage from './pages/ActivitiesListPage'
import ActivitiesCreatePage from './pages/ActivitiesCreatePage'
import ActivitiesEditPage from './pages/ActivitiesEditPage'
import ActivitiesViewPage from './pages/ActivitiesViewPage'

import ActivityTasksListPage from './pages/ActivityTasksListPage'
import ActivityTaskCreatePage from './pages/ActivityTaskCreatePage'

import ActivityDocumentsListPage from './pages/ActivityDocumentsListPage'

import TasksListPage from './pages/TasksListPage'
import TasksCreatePage from './pages/TasksCreatePage'
import TasksEditPage from './pages/TasksEditPage'
import TasksViewPage from './pages/TasksViewPage'

import TaskDocumentsListPage from './pages/TaskDocumentsListPage'

import AreasListPage from './pages/AreasListPage'
import AreasCreatePage from './pages/AreasCreatePage'
import AreasEditPage from './pages/AreasEditPage'
import AreasViewPage from './pages/AreasViewPage'

import DocumentsListPage from './pages/DocumentsListPage'
import DocumentsUploadPage from './pages/DocumentsUploadPage'
import DocumentsEditPage from './pages/DocumentsEditPage'
import DocumentsViewPage from './pages/DocumentsViewPage'

import InstitutionsListPage from './pages/InstitutionsListPage'
import InstitutionsCreatePage from './pages/InstitutionsCreatePage'
import InstitutionsEditPage from './pages/InstitutionsEditPage'
import InstitutionsViewPage from './pages/InstitutionsViewPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <ChatbotAssistant />
              <SidebarLayout />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<HomePage />} />
          <Route path="profile" element={<UserProfilePage />} />

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
          <Route path="projects/:id/activities/create" element={<ProjectActivityCreatePage />} />
          <Route path="projects/:id/activities" element={<ProjectActivitiesListPage />} />
          <Route path="projects/:id/documents" element={<ProjectDocumentsListPage />} />
          <Route path="projects/create" element={<ProjectsCreatePage />} />
          <Route path="projects" element={<ProjectsListPage />} />          
          
          <Route path="agencies/:id/view" element={<AgenciesViewPage />} />
          <Route path="agencies/:id/edit" element={<AgenciesEditPage />} />
          <Route path="agencies/create" element={<AgenciesCreatePage />} />
          <Route path="agencies" element={<AgenciesListPage />} />   

          <Route path="activities/:id/view" element={<ActivitiesViewPage />} />
          <Route path="activities/:id/edit" element={<ActivitiesEditPage />} />
          <Route path="activities/:id/tasks/create" element={<ActivityTaskCreatePage />} />
          <Route path="activities/:id/tasks" element={<ActivityTasksListPage />} />
          <Route path="activities/:id/documents" element={<ActivityDocumentsListPage />} />
          <Route path="activities/create" element={<ActivitiesCreatePage />} />
          <Route path="activities" element={<ActivitiesListPage />} />

          <Route path="tasks/:id/view" element={<TasksViewPage />} />
          <Route path="tasks/:id/edit" element={<TasksEditPage />} />
          <Route path="tasks/:id/documents" element={<TaskDocumentsListPage />} />
          <Route path="tasks/create" element={<TasksCreatePage />} />
          <Route path="tasks" element={<TasksListPage />} />

          <Route path="areas/:id/view" element={<AreasViewPage />} />
          <Route path="areas/:id/edit" element={<AreasEditPage />} />
          <Route path="areas/create" element={<AreasCreatePage />} />
          <Route path="areas" element={<AreasListPage />} />

          <Route path="documents/:id/view" element={<DocumentsViewPage />} />
          <Route path="documents/:id/edit" element={<DocumentsEditPage />} />
          <Route path="documents/upload" element={<DocumentsUploadPage />} />
          <Route path="documents" element={<DocumentsListPage />} />

          <Route path="institutions/:id/view" element={<InstitutionsViewPage />} />
          <Route path="institutions/:id/edit" element={<InstitutionsEditPage />} />
          <Route path="institutions/create" element={<InstitutionsCreatePage />} />
          <Route path="institutions" element={<InstitutionsListPage />} />

        </Route>
      </Routes>
    </Router>
  )
}
