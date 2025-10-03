import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTabs } from '../contexts/TabsContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

interface TelaDisponivel {
    label: string;
    value: string;
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
                const items: TelaDisponivel[] = response.data.map((tela: any) => ({
                    label: tela.titulo_tela,
                    value: `/tela/${tela.nome_tabela}`,
                }));

                if (user?.role === 'sup') {
                    const baseScreens: TelaDisponivel[] = [
                        { label: 'Dicionário de Dados', value: '/dicionario' },
                        { label: 'Gestão de Usuários', value: '/usuarios' },
                        { label: 'Gestão de Acessos', value: '/acessos' },
                    ];
                    // CORREÇÃO AQUI: Adiciona o tipo para 'apiItem'
                    const filteredItems = items.filter((apiItem: TelaDisponivel) => 
                        !baseScreens.some(baseItem => apiItem.value.includes(baseItem.value))
                    );
                    setTelasDisponiveis([...baseScreens, ...filteredItems]);
                } else {
                     setTelasDisponiveis(items);
                }
            } catch (error) {
                console.error("Erro ao buscar telas disponíveis:", error);
            }
        };

        if (user) {
            fetchMenu();
        }
    }, [user]);

    const handleOpenScreen = (tela: TelaDisponivel) => {
        addTab(tela);
        navigate(tela.value);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Bem-vindo ao DMS</Typography>
            <Typography variant="subtitle1" gutterBottom>Selecione uma tela para abrir:</Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {telasDisponiveis.map((tela) => (
                    <Box key={tela.value} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
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