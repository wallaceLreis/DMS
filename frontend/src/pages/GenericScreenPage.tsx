import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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

    const fetchData = async () => {
        if (!tableName) return;
        setLoading(true);
        try {
            const metaResponse = await api.get(`/telas?nome_tabela=${tableName}`);
            if (metaResponse.data.length === 0) {
                throw new Error("Metadata not found");
            }
            const telaInfo = metaResponse.data[0];
            
            // A rota genérica de dados pode não existir para telas base, o que é ok
            let dataResponse;
            try {
                dataResponse = await api.get(`/data/${tableName}`);
                setData(dataResponse.data);
            } catch (dataError) {
                console.log(`Não há uma rota de dados para /data/${tableName}. Isso pode ser normal para telas como 'Dicionário'.`);
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

    useEffect(() => { 
        fetchData(); 
    }, [tableName]);

    const openConfirmDialog = (item: any) => {
        setItemToDelete(item);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete || !tableName) return;
        try {
            await api.delete(`/data/${tableName}/${itemToDelete.id}`);
            fetchData();
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