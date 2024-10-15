'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setProducts } from '../../../store/slices/productSlice';
import { addToCart } from '../../../store/slices/cartSlice';
import { Card, CardBody, CardFooter, Button, Image, Badge } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function BuyerDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const products = useSelector((state: RootState) => state.product.products);
  const token = useSelector((state: RootState) => state.auth.token);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          dispatch(setProducts(data));
        } else {
          console.error('Failed to fetch products:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchProducts();
    }
  }, [dispatch, token]);

  const handleAddToCart = (product: Product) => {
    if (product.quantity > 0) {
      dispatch(addToCart({ ...product, sellerId: 1 }));
    }
  };

  const handleBuyNow = (product: Product) => {
    if (product.quantity > 0) {
      dispatch(addToCart({ ...product, sellerId: 1 }));
      router.push('/buyer/checkout');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center">Available Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="shadow-lg">
            <CardBody className="p-4">
              <div className="relative">
                <Image
                  src={`https://source.unsplash.com/random/300x200?product=${product.id}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                {product.quantity === 0 && (
                  <Badge color="danger" className="absolute top-2 right-2">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">Price: ${product.price.toFixed(2)}</p>
              <p className={`text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
              </p>
            </CardBody>
            <CardFooter className="flex justify-between">
              <Button 
                color="primary" 
                onClick={() => handleAddToCart(product)}
                disabled={product.quantity === 0}
                className={product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Add to Cart
              </Button>
              <Button 
                color="secondary" 
                onClick={() => handleBuyNow(product)}
                disabled={product.quantity === 0}
                className={product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Buy Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
