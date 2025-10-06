import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, IconButton, TextField, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

interface Campo {
    campo_id: number;
    nome_coluna: string;
    titulo_campo: string;
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
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [searchText, setSearchText] = useState('');

    const fetchData = async (query = '') => {
        if (!tableName) return;
        setLoading(true);
        try {
            const metaResponse = await api.get(`/telas?nome_tabela=${tableName}`);
            if (metaResponse.data.length === 0) {
                throw new Error("Metadata not found");
            }
            const telaInfo = metaResponse.data[0];
            
            let dataResponse;
            try {
                // Passa o termo de busca para a API de dados genérica
                dataResponse = await api.get(`/data/${tableName}?q=${query}`);
                setData(dataResponse.data);
            } catch (dataError) {
                console.log(`Não há uma rota de dados para /data/${tableName}.`);
                setData([]);
            }

            setMetadata(telaInfo);
        } catch (error) {
            console.error("Erro:", error);
            setMetadata(null);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Usamos o tableName na dependência para recriar a função de debounce se a tela mudar
    const debouncedFetchData = useMemo(() => debounce(fetchData, 300), [tableName]);

    useEffect(() => { 
        fetchData(); 
    }, [tableName]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        debouncedFetchData(e.target.value);
    };

    const openConfirmDialog = (item: any) => {
        setItemToDelete(item);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete || !tableName) return;
        try {
            await api.delete(`/data/${tableName}/${itemToDelete.id}`);
            fetchData(searchText); // Atualiza a lista respeitando a busca
        } catch (error) {
            console.error("Erro ao deletar registro:", error);
        } finally {
            setItemToDelete(null);
            setConfirmOpen(false);
        }
    };
    
    if (loading) return <CircularProgress />;

    if (!metadata || !metadata.campos) {
        return <Typography>Metadados da tela "{tableName}" não encontrados ou acesso negado.</Typography>;
    }

    const columns: GridColDef[] = metadata.campos.map((campo) => ({
        field: campo.nome_coluna,
        headerName: campo.titulo_campo,
        flex: 1,
    }));
    
    columns.push({
        field: 'actions',
        type: 'actions',
        headerName: 'Ações',
        width: 100,
        renderCell: (params) => (
            <IconButton onClick={() => openConfirmDialog(params.row)}>
                <DeleteIcon />
            </IconButton>
        )
    });

    return (
        <Box>
            <Typography variant="h4" gutterBottom>{metadata.titulo_tela}</Typography>
            
            <TextField
                label="Pesquisar..."
                variant="outlined"
                fullWidth
                value={searchText}
                onChange={handleSearchChange}
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />

            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.id} // Assume que a chave primária de todas as tabelas de dados se chama 'id'
                />
            </Box>

            <ConfirmationDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.`}
            />
        </Box>
    );
};