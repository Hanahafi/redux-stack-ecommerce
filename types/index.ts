export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sellerId: number;
}

export interface CartItem extends Product {
  cartQuantity: number;
}
