'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { removeFromCart, updateQuantity } from '../../../store/slices/cartSlice';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input } from "@nextui-org/react";
import { useRouter } from 'next/navigation';

export default function Cart() {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id: number, quantity: number, maxQuantity: number) => {
    dispatch(updateQuantity({ id, quantity: Math.min(quantity, maxQuantity) }));
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <Table aria-label="Cart items">
            <TableHeader>
              <TableColumn>Product</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn>Quantity</TableColumn>
              <TableColumn>Total</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.cartQuantity.toString()}
                      onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value), item.quantity)}
                      min="1"
                      max={item.quantity}
                    />
                  </TableCell>
                  <TableCell>${(item.price * item.cartQuantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button color="danger" onClick={() => handleRemoveItem(item.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-8 text-right">
            <p className="text-2xl font-bold">Total: ${totalPrice.toFixed(2)}</p>
            <Button color="primary" className="mt-4" onClick={() => router.push('/buyer/checkout')}>
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
