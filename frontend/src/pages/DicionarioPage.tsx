import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Box, Typography, Button, Modal, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, IconButton, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

const modalStyle = {
  position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '80%', height: '80%', bgcolor: 'background.paper', border: '2px solid #000',
  boxShadow: 24, p: 4, display: 'flex', flexDirection: 'column'
};

interface Campo {
    campo_id: number;
    nome_coluna: string;
    titulo_campo: string;
    tipo_dado: string;
    formato_campo: string;
    is_nativo: boolean;
}
interface TelaDetalhada {
  tela_id: number;
  nome_tabela: string;
  titulo_tela: string;
  ativo: boolean;
  campos: Campo[];
}

export const DicionarioPage = () => {
    const [telas, setTelas] = useState<any[]>([]);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedTela, setSelectedTela] = useState<TelaDetalhada | null>(null);
    const [isFieldDialogOpen, setFieldDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<Partial<Campo> | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [searchText, setSearchText] = useState('');

    const fetchTelas = async (query = '') => {
        const response = await api.get(`/telas?q=${query}`);
        setTelas(response.data);
    };

    const debouncedFetch = useMemo(() => debounce(fetchTelas, 300), []);

    useEffect(() => {
        fetchTelas();
    }, []);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        debouncedFetch(e.target.value);
    };

    const refreshSelectedTela = async (telaId: number) => {
        const response = await api.get(`/telas/${telaId}`);
        setSelectedTela(response.data);
    };

    const handleRowDoubleClick = async (params: GridRowParams) => {
        await refreshSelectedTela(params.id as number);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedTela(null);
    };
    
    const handleSaveChanges = async () => {
        if (!selectedTela) return;
        await api.put(`/telas/${selectedTela.tela_id}`, {
            titulo_tela: selectedTela.titulo_tela,
            nome_tabela: selectedTela.nome_tabela,
            ativo: selectedTela.ativo
        });
        handleCloseDetailModal();
        fetchTelas();
    };

    const handleOpenFieldDialog = (field: Partial<Campo> | null = null) => {
        setEditingField(field || { tipo_dado: 'TEXT', formato_campo: 'texto' });
        setFieldDialogOpen(true);
    };
    const handleCloseFieldDialog = () => setFieldDialogOpen(false);

    const handleSaveField = async () => {
        if (!editingField || !selectedTela) return;
        try {
            if (editingField.campo_id) {
                await api.put(`/telas/${selectedTela.tela_id}/campos/${editingField.campo_id}`, editingField);
            } else {
                await api.post(`/telas/${selectedTela.tela_id}/campos`, editingField);
            }
            await refreshSelectedTela(selectedTela.tela_id);
            handleCloseFieldDialog();
        } catch (error) {
            console.error("Erro ao salvar campo:", error)
        }
    };

    const openConfirmDialog = (item: any) => {
        setItemToDelete(item);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.campo_id) {
                await api.delete(`/telas/${selectedTela?.tela_id}/campos/${itemToDelete.campo_id}`);
                await refreshSelectedTela(selectedTela!.tela_id);
            } else {
                await api.delete(`/telas/${itemToDelete.tela_id}`);
                fetchTelas();
            }
        } catch(error) {
            console.error("Erro ao deletar:", error);
        } finally {
            setItemToDelete(null);
            setConfirmOpen(false);
        }
    };
    
    const columns: GridColDef[] = [
      { field: 'tela_id', headerName: 'ID', width: 90 },
      { field: 'titulo_tela', headerName: 'Título da Tela', flex: 1 },
      { field: 'nome_tabela', headerName: 'Nome da Tabela (DB)', flex: 1 },
      { field: 'ativo', headerName: 'Ativo', width: 120, type: 'boolean' },
      {
          field: 'actions', type: 'actions', headerName: 'Ações',
          renderCell: (params) => (
              <IconButton onClick={() => openConfirmDialog(params.row)} disabled={params.row.is_nativo}>
                  <DeleteIcon />
              </IconButton>
          )
      }
    ];

    const camposColumns: GridColDef[] = [
        { field: 'campo_id', headerName: 'ID', width: 90 },
        { field: 'titulo_campo', headerName: 'Título do Campo', flex: 1 },
        { field: 'nome_coluna', headerName: 'Nome da Coluna (DB)', flex: 1 },
        { field: 'tipo_dado', headerName: 'Tipo', width: 150 },
        { field: 'is_nativo', headerName: 'Nativo', width: 100, type: 'boolean' },
        {
            field: 'actions', type: 'actions', headerName: 'Ações', width: 120,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleOpenFieldDialog(params.row)} disabled={params.row.is_nativo}><EditIcon /></IconButton>
                    <IconButton onClick={() => openConfirmDialog(params.row)} disabled={params.row.is_nativo}><DeleteIcon /></IconButton>
                </>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Dicionário de Dados</Typography>
                <Button variant="contained" startIcon={<AddIcon />}>Nova Tela</Button>
            </Box>

            <TextField
                label="Pesquisar por Título da Tela"
                variant="outlined"
                fullWidth
                value={searchText}
                onChange={handleSearchChange}
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            
            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid rows={telas} columns={columns} getRowId={(row) => row.tela_id} onRowDoubleClick={handleRowDoubleClick} />
            </Box>
            
            <Modal open={isDetailModalOpen} onClose={handleCloseDetailModal}>
                <Box sx={modalStyle}>
                    {selectedTela && (
                        <>
                        <Typography variant="h5" gutterBottom>Detalhes da Tela: {selectedTela.titulo_tela}</Typography>
                        <Box component="form" sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <TextField label="Título da Tela" defaultValue={selectedTela.titulo_tela} fullWidth />
                            <TextField label="Nome da Tabela (DB)" defaultValue={selectedTela.nome_tabela} fullWidth />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Campos</Typography>
                            <Button startIcon={<AddIcon />} onClick={() => handleOpenFieldDialog()}>Adicionar Campo</Button>
                        </Box>
                        <Box sx={{ flexGrow: 1, mt: 1 }}>
                            <DataGrid rows={selectedTela.campos} columns={camposColumns} getRowId={(row) => row.campo_id}/>
                        </Box>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={handleCloseDetailModal}>Cancelar</Button>
                            <Button onClick={handleSaveChanges} variant="contained" sx={{ ml: 2 }}>Salvar Alterações</Button>
                        </Box>
                        </>
                    )}
                </Box>
            </Modal>

            <Dialog open={isFieldDialogOpen} onClose={handleCloseFieldDialog}>
                <DialogTitle>{editingField?.campo_id ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Nome da Coluna (DB)" fullWidth defaultValue={editingField?.nome_coluna || ''} onChange={(e) => setEditingField({...editingField, nome_coluna: e.target.value})} disabled={!!editingField?.campo_id}/>
                    <TextField margin="dense" label="Título do Campo" fullWidth defaultValue={editingField?.titulo_campo || ''} onChange={(e) => setEditingField({...editingField, titulo_campo: e.target.value})}/>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Tipo de Dado</InputLabel>
                        <Select label="Tipo de Dado" value={editingField?.tipo_dado || 'TEXT'} onChange={(e) => setEditingField({...editingField, tipo_dado: e.target.value as string})}>
                            <MenuItem value="TEXT">Texto</MenuItem>
                            <MenuItem value="INTEGER">Inteiro</MenuItem>
                            <MenuItem value="DECIMAL">Decimal</MenuItem>
                            <MenuItem value="BOOLEAN">Booleano</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseFieldDialog}>Cancelar</Button>
                    <Button onClick={handleSaveField} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir "${itemToDelete?.titulo_tela || itemToDelete?.titulo_campo}"?`}
            />
        </Box>
    );
};