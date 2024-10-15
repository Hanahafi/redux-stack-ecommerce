'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { clearCart } from '../../../store/slices/cartSlice';
import { Card, CardBody, Input, Button } from "@nextui-org/react";
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [address, setAddress] = useState('');

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/buyer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          totalPrice,
          address
        }),
      });

      if (response.ok) {
        dispatch(clearCart());
        router.push('/buyer/order-confirmation');
      } else {
        console.error('Failed to create order:', await response.text());
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      <Card className="mb-8">
        <CardBody>
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <span>{item.name} x {item.cartQuantity}</span>
              <span>${(item.price * item.cartQuantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="text-xl font-bold mt-4">
            Total: ${totalPrice.toFixed(2)}
          </div>
        </CardBody>
      </Card>
      <Card className="mb-8">
        <CardBody>
          <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mb-4"
          />
        </CardBody>
      </Card>
      <Button color="primary" onClick={handleCheckout}>
        Place Order
      </Button>
    </div>
  );
}
