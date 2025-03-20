export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export interface Queries {
  filter?: string;
  sort?: string;
  limit?: string;
  page?: string;
  include?: string;
  exclude?: string;
  fields?: string;
  [key: string]: any;
}
