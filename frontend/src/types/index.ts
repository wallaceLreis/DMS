export interface Unidade {
    unidade_id?: number;
    id?: number;
    descricao: string;
    ean: string;
    fator_conversao: number | string;
    peso: number | string;
    altura: number | string;
    largura: number | string;
    profundidade: number | string;
}

export interface Produto {
    produto_id?: number;
    codigo?: number;
    nome: string;
    ean: string;
    imagem_url?: string;
    altura: number | string;
    largura: number | string;
    profundidade: number | string;
    peso: number | string;
    unidades?: Unidade[];
    [key: string]: any;
}

// NOVA INTERFACE ADICIONADA
export interface Empresa {
    empresa_id?: number;
    nome_fantasia: string;
    razao_social: string;
    cnpj: string;
    email?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
}