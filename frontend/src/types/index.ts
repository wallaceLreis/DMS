export interface Unidade {
    unidade_id?: number;
    id?: number; // Para controle de ID temporário no frontend
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
    unidades?: Unidade[]; // Array de unidades/embalagens
    [key: string]: any;
}