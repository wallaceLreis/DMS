// frontend/src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { DicionarioPage } from '../pages/DicionarioPage';
import { UsuariosPage } from '../pages/UsuariosPage'; // <-- IMPORTE A NOVA TELA
import { HomePage } from '../pages/HomePage';
import { GenericScreenPage } from '../pages/GenericScreenPage';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { AcessosPage } from '../pages/AcessosPage';

const ProtectedRoute = () => {
  const { token } = useAuth();
  return token ? <MainLayout /> : <Navigate to="/login" />;
};

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
        { path: '/', element: <Navigate to="/inicio" replace /> },
        { path: 'inicio', element: <HomePage /> },
        { path: 'dicionario', element: <DicionarioPage /> },
        { path: 'usuarios', element: <UsuariosPage /> },
        { path: 'acessos', element: <AcessosPage /> },
        { path: 'tela/:tableName', element: <GenericScreenPage /> },
    ]
  },
  { path: '*', element: <Navigate to="/" /> },
]);