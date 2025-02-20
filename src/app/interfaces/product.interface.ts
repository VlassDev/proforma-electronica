export interface Product {
  count: number;
  priceU: number | null;
  priceT: number;
  description: string;
  id: any;
}

export interface Impuesto {
  subtotal: number;
  impuesto: number;
  total: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
}
