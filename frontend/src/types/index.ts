// A interface Unidade foi removida

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
    [key: string]: any;
}