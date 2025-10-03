import { useEffect, useState } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Define a interface para os dados da tela
interface Tela {
  tela_id: number;
  nome_tabela: string;
  titulo_tela: string;
  ativo: boolean;
}

export const DicionarioPage = () => {
  const [telas, setTelas] = useState<Tela[]>([]);

  useEffect(() => {
    // Busca as telas da API quando o componente é montado
    const fetchTelas = async () => {
      try {
        const response = await api.get('/telas');
        setTelas(response.data);
      } catch (error) {
        console.error("Erro ao buscar telas:", error);
      }
    };
    fetchTelas();
  }, []);

  // Define as colunas da nossa tabela
  const columns: GridColDef[] = [
    { field: 'tela_id', headerName: 'ID', width: 90 },
    { field: 'titulo_tela', headerName: 'Título da Tela', width: 250 },
    { field: 'nome_tabela', headerName: 'Nome da Tabela (DB)', width: 250 },
    { field: 'ativo', headerName: 'Ativo', width: 120, type: 'boolean' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Dicionário de Dados</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nova Tela
        </Button>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={telas}
          columns={columns}
          getRowId={(row) => row.tela_id} // Informa ao DataGrid qual campo é o ID único
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>
    </Box>
  );
};