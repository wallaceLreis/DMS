import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTabs } from '../contexts/TabsContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

interface TelaApi {
    titulo_tela: string;
    nome_tabela: string;
}

interface TelaDisponivel {
    label: string;
    nome_tabela: string;
}

export const HomePage = () => {
    const [telasDisponiveis, setTelasDisponiveis] = useState<TelaDisponivel[]>([]);
    const { user } = useAuth();
    const { addTab } = useTabs();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get('/usuarios/me/menu');
                const items: TelaDisponivel[] = response.data.map((tela: TelaApi) => ({
                    label: tela.titulo_tela,
                    nome_tabela: tela.nome_tabela,
                }));
                setTelasDisponiveis(items);
            } catch (error) {
                console.error("Erro ao buscar telas disponíveis:", error);
            }
        };

        if (user) {
            fetchMenu();
        }
    }, [user]);

    const handleOpenScreen = (tela: TelaDisponivel) => {
        // CORREÇÃO AQUI: Adicionado 'produtos' à lista de telas base
        const baseScreens = ['dicionario', 'usuarios', 'acessos', 'produtos'];
        
        const path = baseScreens.includes(tela.nome_tabela)
            ? `/${tela.nome_tabela}`
            : `/tela/${tela.nome_tabela}`;
        
        const tabToOpen = { label: tela.label, value: path };

        addTab(tabToOpen);
        navigate(path);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Bem-vindo ao DMS</Typography>
            <Typography variant="subtitle1" gutterBottom>Selecione uma tela para abrir:</Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {telasDisponiveis.map((tela) => (
                    <Box key={tela.nome_tabela} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
                        <Card sx={{ height: '100%' }}>
                            <CardActionArea onClick={() => handleOpenScreen(tela)} sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {tela.label}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};