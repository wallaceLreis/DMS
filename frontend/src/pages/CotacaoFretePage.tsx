import { useState } from 'react';
import api from '../services/api';
import { Box, Typography, Button, TextField, Grid, Card, CardContent, CircularProgress, Avatar } from '@mui/material';

export const CotacaoFretePage = () => {
    const [formData, setFormData] = useState({
        from_postal_code: '96020360', to_postal_code: '01018020',
        width: '11', height: '17', length: '11', weight: '0.3', insurance_value: '10.1'
    });
    const [cotacoes, setCotacoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCalcular = async () => {
        setLoading(true);
        setCotacoes([]);
        try {
            const response = await api.post('/frete/calcular', formData);
            setCotacoes(response.data);
        } catch (error) {
            console.error("Erro ao calcular frete:", error);
            alert("Não foi possível calcular o frete.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Cotação de Frete</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}><TextField name="from_postal_code" label="CEP Origem" value={formData.from_postal_code} onChange={handleChange} fullWidth /></Grid>
                <Grid item xs={6} md={3}><TextField name="to_postal_code" label="CEP Destino" value={formData.to_postal_code} onChange={handleChange} fullWidth /></Grid>
                <Grid item xs={6} md={3}><TextField name="insurance_value" label="Valor Segurado (R$)" value={formData.insurance_value} onChange={handleChange} type="number" fullWidth /></Grid>
                <Grid item xs={6} md={3}><TextField name="weight" label="Peso (KG)" value={formData.weight} onChange={handleChange} type="number" fullWidth /></Grid>
                <Grid item xs={4} md={2}><TextField name="height" label="Altura (CM)" value={formData.height} onChange={handleChange} type="number" fullWidth /></Grid>
                <Grid item xs={4} md={2}><TextField name="width" label="Largura (CM)" value={formData.width} onChange={handleChange} type="number" fullWidth /></Grid>
                <Grid item xs={4} md={2}><TextField name="length" label="Comprimento (CM)" value={formData.length} onChange={handleChange} type="number" fullWidth /></Grid>
                <Grid item xs={12} md={6}>
                    <Button onClick={handleCalcular} variant="contained" size="large" fullWidth disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Calcular Frete'}
                    </Button>
                </Grid>
            </Grid>

            {cotacoes.length > 0 && (
                <Box>
                    <Typography variant="h5" gutterBottom>Resultados</Typography>
                    <Grid container spacing={2}>
                        {cotacoes.map(cotacao => (
                            <Grid item xs={12} md={6} lg={4} key={cotacao.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar src={cotacao.company.picture} sx={{ mr: 2 }} />
                                            <Typography variant="h6">{cotacao.company.name} - {cotacao.name}</Typography>
                                        </Box>
                                        <Typography variant="h4" color="primary">R$ {cotacao.price}</Typography>
                                        <Typography color="text.secondary">Prazo de entrega: {cotacao.delivery_time} dias</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};