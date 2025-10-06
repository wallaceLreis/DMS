import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { GenericScreenPage } from '../pages/GenericScreenPage';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { AcessosPage } from '../pages/AcessosPage';
import { DicionarioPage } from '../pages/DicionarioPage';
import { UsuariosPage } from '../pages/UsuariosPage';
import { ProdutosPage } from '../pages/ProdutosPage';
import { EstoquePage } from '../pages/EstoquePage';
import { CotacaoFretePage } from '../pages/CotacaoFretePage';
import { EmpresasPage } from '../pages/EmpresasPage'; // Importa a nova página

const ProtectedRoute = () => {
  const { token } = useAuth();
  return token ? <MainLayout /> : <Navigate to="/login" />;
};

export const routerConfig: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
        { path: '/', element: <Navigate to="/inicio" replace /> },
        { path: 'inicio', element: <HomePage /> },
        
        // Rotas para as telas customizadas
        { path: 'dicionario', element: <DicionarioPage /> },
        { path: 'usuarios', element: <UsuariosPage /> },
        { path: 'acessos', element: <AcessosPage /> },
        { path: 'produtos', element: <ProdutosPage /> },
        { path: 'estoque', element: <EstoquePage /> },
        { path: 'cotacao-frete', element: <CotacaoFretePage /> },
        { path: 'empresas', element: <EmpresasPage /> }, // <-- NOVA ROTA ADICIONADA
        
        // Rota genérica para telas dinâmicas
        { path: 'tela/:tableName', element: <GenericScreenPage /> },
    ]
  },
  { path: '*', element: <Navigate to="/" /> },
];