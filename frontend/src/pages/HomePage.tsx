// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// IMPORTAÇÃO CORRETA DO GRID CLÁSSICO
import Grid from '@mui/material/Grid';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

interface Tela {
  tela_id: number;
  titulo_tela: string;
  nome_tabela: string;
}

export const HomePage = () => {
  const [telas, setTelas] = useState<Tela[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTelas = async () => {
      try {
        const response = await api.get('/telas?ativo=true');
        const allTelas = [
          { tela_id: 9999, titulo_tela: 'Dicionário de Dados', nome_tabela: 'dicionario' },
          { tela_id: 9998, titulo_tela: 'Usuários', nome_tabela: 'usuarios' },
          ...response.data
        ];
        setTelas(allTelas);
      } catch (error) {
        console.error("Erro ao buscar telas:", error);
      }
    };
    fetchTelas();
  }, []);

  const handleCardClick = (tableName: string) => {
    if (tableName === 'dicionario' || tableName === 'usuarios') {
      navigate(`/${tableName}`);
    } else {
      navigate(`/tela/${tableName}`);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao DMS
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Selecione uma tela para começar:
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {telas.map((tela) => (
          <Grid item xs={12} sm={6} md={4} key={tela.tela_id}>
            <Card>
              <CardActionArea onClick={() => handleCardClick(tela.nome_tabela)}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {tela.titulo_tela}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
