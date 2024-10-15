'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setProducts } from '../../../store/slices/productSlice';
import { addToCart } from '../../../store/slices/cartSlice';
import { Card, CardBody, CardFooter, Button, Badge } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Product } from '../../../types';
import Image from 'next/image';
import LoadingSpinner from '../../../components/LoadingSpinner';

const placeholderImages = [
  '/placeholder1.jpg',
  '/placeholder2.jpg',
  '/placeholder3.jpg',
  '/placeholder4.jpg',
  '/placeholder5.jpg',
];

export default function BuyerProducts() {
  const dispatch = useDispatch();
  const router = useRouter();
  const products = useSelector((state: RootState) => state.product.products);
  const token = useSelector((state: RootState) => state.auth.token);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      dispatch(setProducts(data));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.quantity > 0) {
      dispatch(addToCart(product));
    }
  }, [dispatch]);

  const handleBuyNow = useCallback((product: Product) => {
    if (product.quantity > 0) {
      dispatch(addToCart(product));
      router.push('/buyer/checkout');
    }
  }, [dispatch, router]);

  const productList = useMemo(() => products.map((product) => (
    <motion.div
      key={product.id}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-[400px] flex flex-col">
        <CardBody className="p-0 flex-grow">
          <div className="relative h-48">
            <Image
              src={placeholderImages[product.id % placeholderImages.length]}
              alt={product.name}
              layout="fill"
              objectFit="cover"
            />
            {product.quantity === 0 && (
              <div className="absolute top-0 right-0 bg-red-500 bg-opacity-75 text-white px-2 py-1 m-2 rounded">
                Out of Stock
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
            <div>
              <h2 className="text-lg font-semibold mb-1 line-clamp-2">{product.name}</h2>
              <p className="text-gray-600 mb-1 text-sm">Price: ${product.price.toFixed(2)}</p>
              <p className={`text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
              </p>
            </div>
          </div>
        </CardBody>
        <CardFooter className="p-4 pt-0">
          <div className="flex justify-between w-full gap-2">
            <Button 
              color="primary" 
              onClick={() => handleAddToCart(product)}
              disabled={product.quantity === 0}
              className={`flex-1 ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              size="sm"
            >
              Add to Cart
            </Button>
            <Button 
              color="secondary" 
              onClick={() => handleBuyNow(product)}
              disabled={product.quantity === 0}
              className={`flex-1 ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              size="sm"
            >
              Buy Now
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )), [products, handleAddToCart, handleBuyNow]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productList}
      </div>
    </div>
  );
}
