// src/pages/GenericScreenPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress } from '@mui/material';

interface Campo {
  titulo_campo: string;
  nome_coluna: string;
  tipo_dado: string;
}

interface TelaMetadata {
  titulo_tela: string;
  campos: Campo[];
}

export const GenericScreenPage = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const [metadata, setMetadata] = useState<TelaMetadata | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableName) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Busca os metadados da tela
        // (Você precisaria criar esta rota no backend que busca tela por nome_tabela)
        const metaResponse = await api.get(`/telas?nome_tabela=${tableName}`); 
        const telaInfo = metaResponse.data[0]; // Supondo que a API retorne um array

        // 2. Busca os dados reais da tabela
        const dataResponse = await api.get(`/data/${tableName}`);

        setMetadata(telaInfo);
        setData(dataResponse.data);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!metadata) {
    return <Typography>Tela "{tableName}" não encontrada ou configurada.</Typography>;
  }

  // 3. Constrói as colunas do DataGrid dinamicamente a partir dos metadados
  const columns: GridColDef[] = metadata.campos.map((campo) => ({
    field: campo.nome_coluna,
    headerName: campo.titulo_campo,
    width: 150,
    // Poderíamos adicionar mais lógica aqui baseada no tipo_dado (ex: formatação de número/data)
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{metadata.titulo_tela}</Typography>
      <Box sx={{ height: 600, width: '100%' }}>
        {/* O ID da linha precisa ser uma coluna real na sua tabela de dados, ex: 'id' ou 'cliente_id' */}
        <DataGrid rows={data} columns={columns} getRowId={(row) => row.id} /> 
      </Box>
    </Box>
  );
};