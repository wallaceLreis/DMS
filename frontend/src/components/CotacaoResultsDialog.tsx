import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, Avatar, Tabs, Tab, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid/models';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ScatterChart, Scatter, ZAxis, Label
} from 'recharts';
import api from '../services/api';

interface Resultado {
    resultado_id: number;
    transportadora: string;
    servico: string;
    preco: string;
    prazo_entrega: number;
    url_logo: string;
}

interface CotacaoData {
    resultados: Resultado[];
}

interface DialogProps {
    open: boolean;
    onClose: () => void;
    cotacaoId: number | null;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number; }) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

// Tooltip customizado para o gráfico de dispersão
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <Box sx={{ bgcolor: 'white', p: 1.5, border: '1px solid #ccc', borderRadius: '4px' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{data.name}</Typography>
                <Typography variant="caption">
                    Preço: {Number(data.preço).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Typography><br />
                <Typography variant="caption">Prazo: {data.prazo} dias</Typography>
            </Box>
        );
    }
    return null;
};

export const CotacaoResultsDialog = ({ open, onClose, cotacaoId }: DialogProps) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CotacaoData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [chartType, setChartType] = useState<'preco' | 'prazo' | 'custoBeneficio'>('prazo');

    useEffect(() => {
        if (open && cotacaoId) {
            setLoading(true);
            setData(null);
            setError(null);
            api.get(`/frete/cotacoes/${cotacaoId}`)
                .then(res => setData(res.data))
                .catch(err => {
                    console.error("Erro ao buscar resultados da cotação", err);
                    setError("Não foi possível carregar os detalhes da cotação.");
                })
                .finally(() => setLoading(false));
        }
    }, [open, cotacaoId]);

    const chartData = data?.resultados.map(r => ({
        name: `${r.transportadora.slice(0, 10)} (${r.servico.slice(0, 10)})`,
        preço: parseFloat(r.preco),
        prazo: r.prazo_entrega,
    })) ?? [];

    const sortedChartData = chartType === 'preco'
        ? [...chartData].sort((a, b) => a.preço - b.preço)
        : [...chartData].sort((a, b) => a.prazo - b.prazo);

    const columns: GridColDef[] = [
        {
            field: 'url_logo', headerName: 'Logo', width: 80, sortable: false, filterable: false,
            renderCell: (params) => (
                <Avatar
                    src={params.value}
                    sx={{
                        width: 56, height: 32, borderRadius: '4px',
                        bgcolor: 'transparent', '& img': { objectFit: 'contain' }
                    }}
                    variant="square"
                />
            )
        },
        { field: 'transportadora', headerName: 'Transportadora', flex: 1 },
        { field: 'servico', headerName: 'Serviço', flex: 1 },
        {
            field: 'preco', headerName: 'Preço', width: 150, type: 'number',
            valueFormatter: (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        { field: 'prazo_entrega', headerName: 'Prazo (dias)', width: 150, type: 'number' },
    ];

    // Geração do gráfico
    const renderChart = (): React.ReactElement => {
        switch (chartType) {
            case 'custoBeneficio':
                return (
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="preço" name="Preço" unit=" R$">
                            <Label value="Preço (R$)" offset={-15} position="insideBottom" />
                        </XAxis>
                        <YAxis type="number" dataKey="prazo" name="Prazo" unit=" dias">
                            <Label value="Prazo (dias)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <ZAxis dataKey="name" name="Serviço" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" />
                        <Scatter name="Opções de Frete" data={chartData} fill="#8884d8" />
                    </ScatterChart>
                );

            case 'preco':
                return (
                    <BarChart data={sortedChartData} margin={{ top: 5, right: 20, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} />
                        <YAxis label={{ value: 'Reais (R$)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="preço" fill="#82ca9d" name="Preço (R$)" />
                    </BarChart>
                );

            case 'prazo':
            default:
                return (
                    <BarChart data={sortedChartData} margin={{ top: 5, right: 20, left: 10, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} />
                        <YAxis label={{ value: 'Dias', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `${value} dias`} />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="prazo" fill="#8884d8" name="Prazo (dias)" />
                    </BarChart>
                );
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>Resultados da Cotação #{cotacaoId}</DialogTitle>
            <DialogContent>
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
                {!loading && error && <Typography color="error" sx={{ p: 4 }}>{error}</Typography>}
                {!loading && data && (
                    <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabIndex} onChange={(_e, val) => setTabIndex(val)}>
                                <Tab label="Tabela de Opções" />
                                <Tab label="Gráficos Comparativos" />
                            </Tabs>
                        </Box>

                        <TabPanel value={tabIndex} index={0}>
                            <Box sx={{ height: 450, width: '100%', mt: 2 }}>
                                <DataGrid
                                    rows={data.resultados}
                                    columns={columns}
                                    getRowId={(row) => row.resultado_id}
                                    density="standard"
                                />
                            </Box>
                        </TabPanel>

                        <TabPanel value={tabIndex} index={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <ToggleButtonGroup
                                    color="primary"
                                    value={chartType}
                                    exclusive
                                    onChange={(_e, newType) => newType && setChartType(newType)}
                                >
                                    <ToggleButton value="prazo">Agilidade</ToggleButton>
                                    <ToggleButton value="preco">Menor Custo</ToggleButton>
                                    <ToggleButton value="custoBeneficio">Custo-Benefício</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            <ResponsiveContainer width="100%" height={400}>
                                {renderChart()}
                            </ResponsiveContainer>
                        </TabPanel>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
};
