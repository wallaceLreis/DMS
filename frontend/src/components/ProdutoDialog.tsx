import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Tab, Box, Typography, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowId } from '@mui/x-data-grid/models';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import type { Produto, Unidade } from '../types';

interface ProdutoDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: FormData, produtoId?: number) => void;
    produto: Produto | null;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number; }) {
    const { children, value, index, ...other } = props;
    return <div role="tabpanel" hidden={value !== index} {...other}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

const initialFormData: Partial<Produto> = { 
    nome: '', ean: '', altura: '', largura: '', profundidade: '', peso: '', unidades: [] 
};

export const ProdutoDialog = ({ open, onClose, onSave, produto }: ProdutoDialogProps) => {
    const [formData, setFormData] = useState<Partial<Produto>>(initialFormData);
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (open) {
            const productData = produto || initialFormData;
            setFormData(productData);
            
            const baseUnit = productData.unidades?.find((u: Unidade) => u.fator_conversao === 1) || {
                id: Date.now(), descricao: 'UN', fator_conversao: 1, ean: productData.ean || '',
                peso: productData.peso || '', altura: productData.altura || '', largura: productData.largura || '', profundidade: productData.profundidade || ''
            };
            const otherUnits = productData.unidades?.filter((u: Unidade) => u.fator_conversao !== 1) || [];
            
            setUnidades([baseUnit, ...otherUnits]);
            setSelectedFile(null);
            setTabIndex(0);
        }
    }, [produto, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBaseUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const baseUnitIndex = unidades.findIndex(u => u.fator_conversao === 1);
        if (baseUnitIndex !== -1) {
            const updatedUnits = [...unidades];
            updatedUnits[baseUnitIndex] = { ...updatedUnits[baseUnitIndex], [e.target.name]: e.target.value };
            setUnidades(updatedUnits);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue);

    const handleSave = () => {
        const data = new FormData();
        const baseUnit = unidades.find(u => u.fator_conversao === 1);
        
        data.append('nome', formData.nome || '');
        data.append('ean', baseUnit?.ean || '');
        data.append('altura', String(baseUnit?.altura || 0));
        data.append('largura', String(baseUnit?.largura || 0));
        data.append('profundidade', String(baseUnit?.profundidade || 0));
        data.append('peso', String(baseUnit?.peso || 0));
        data.append('unidades', JSON.stringify(unidades));

        if (selectedFile) data.append('imagem', selectedFile);
        onSave(data, formData.produto_id);
    };

    const handleProcessRowUpdate = (newRow: Unidade): Unidade => {
        const updatedRows = unidades.map(row => (row.id || row.unidade_id) === (newRow.id || newRow.unidade_id) ? newRow : row);
        setUnidades(updatedRows);
        return newRow;
    };

    const handleDeleteUnidade = (id: GridRowId) => {
        setUnidades(unidades.filter(u => (u.id || u.unidade_id) !== id));
    };
    
    const unidadesColumns: GridColDef[] = [
        { field: 'descricao', headerName: 'Descrição', flex: 1, editable: true, type: 'singleSelect', valueOptions: ['UN', 'PC', 'CX', 'FD', 'PCT', 'RL', 'KG', 'L', 'M', 'M²', 'M³'] },
        { field: 'fator_conversao', headerName: 'Fator', width: 80, type: 'number', editable: true },
        { field: 'ean', headerName: 'EAN', width: 140, editable: true },
        { field: 'peso', headerName: 'Peso (KG)', width: 100, type: 'number', editable: true },
        { field: 'altura', headerName: 'Altura (CM)', width: 100, type: 'number', editable: true },
        { field: 'largura', headerName: 'Largura (CM)', width: 100, type: 'number', editable: true },
        { field: 'profundidade', headerName: 'Prof. (CM)', width: 100, type: 'number', editable: true },
        { field: 'actions', type: 'actions', headerName: ' ', width: 50,
          renderCell: params => (
            <IconButton onClick={() => handleDeleteUnidade(params.id)} disabled={params.row.fator_conversao === 1}>
                <DeleteIcon />
            </IconButton>
          )
        },
    ];
    
    const baseUnit = unidades.find(u => u.fator_conversao === 1);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>{formData.produto_id ? `Editar Produto: ${formData.nome}` : 'Novo Produto'}</DialogTitle>
            <DialogContent>
                <TextField name="nome" label="Nome do Produto *" value={formData.nome || ''} onChange={handleChange} fullWidth margin="normal" />
                <Button variant="contained" component="label" startIcon={<PhotoCamera />}> Carregar Imagem
                    <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                </Button>
                {selectedFile && <Typography variant="caption" sx={{ml: 2}}>{selectedFile.name}</Typography>}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label="Unidade Base" />
                        <Tab label="Unidades Alternativas" />
                    </Tabs>
                </Box>
                <TabPanel value={tabIndex} index={0}>
                    <Typography variant="h6" sx={{mt: 2}}>Dimensões e EAN da Unidade Principal (Fator 1)</Typography>
                    {baseUnit && <>
                        <TextField name="ean" label="EAN13/DUN14 *" value={baseUnit.ean || ''} onChange={handleBaseUnitChange} fullWidth margin="normal" />
                        <TextField name="altura" label="Altura (CM) *" type="number" value={baseUnit.altura || ''} onChange={handleBaseUnitChange} margin="normal" sx={{mr: 1}}/>
                        <TextField name="largura" label="Largura (CM) *" type="number" value={baseUnit.largura || ''} onChange={handleBaseUnitChange} margin="normal" sx={{mr: 1}}/>
                        <TextField name="profundidade" label="Profundidade (CM) *" type="number" value={baseUnit.profundidade || ''} onChange={handleBaseUnitChange} margin="normal" sx={{mr: 1}}/>
                        <TextField name="peso" label="Peso (KG) *" type="number" value={baseUnit.peso || ''} onChange={handleBaseUnitChange} margin="normal"/>
                    </>}
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">Unidades Alternativas de Compra/Venda</Typography>
                        <Button startIcon={<AddIcon />} onClick={() => setUnidades([...unidades, { id: Date.now(), descricao: 'CX', fator_conversao: '', ean: '', peso: '', altura: '', largura: '', profundidade: '' }])}>
                            Adicionar Unidade
                        </Button>
                    </Box>
                    <Box sx={{height: 350, width: '100%'}}>
                        <DataGrid 
                            rows={unidades.filter(u => u.fator_conversao !== 1)}
                            columns={unidadesColumns}
                            getRowId={(row: Unidade) => row.id ?? row.unidade_id ?? Math.random()}
                            processRowUpdate={handleProcessRowUpdate}
                            editMode="row"
                        />
                    </Box>
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};