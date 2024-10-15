'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button } from "@nextui-org/react";
import confetti from 'canvas-confetti';

export default function OrderConfirmation() {
  const router = useRouter();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardBody className="text-center">
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="mb-8">Thank you for your purchase. Your order has been successfully placed.</p>
          <Button color="primary" onClick={() => router.push('/buyer/orders')}>
            View My Orders
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
