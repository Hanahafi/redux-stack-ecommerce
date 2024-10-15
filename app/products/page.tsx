'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setProducts } from '../../store/slices/productSlice';
import { Card, CardBody, CardFooter, Button, Image } from '@nextui-org/react';

export default function Products() {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.product.products);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        dispatch(setProducts(data));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="shadow-lg">
            <CardBody className="p-4">
              <Image
                src={`https://source.unsplash.com/random/300x200?product=${product.id}`}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">Price: ${product.price}</p>
              <p className="text-gray-600">Quantity: {product.quantity}</p>
            </CardBody>
            <CardFooter className="flex justify-between">
              {user?.role === 'buyer' && (
                <Button color="primary" fullWidth>Add to Cart</Button>
              )}
              {user?.role === 'seller' && user.id === product.sellerId && (
                <Button color="secondary" fullWidth>Edit</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
