'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Card, CardBody, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function SellerProducts() {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }
    try {
      console.log('Fetching products...');
      const response = await fetch('/api/seller/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Products fetched successfully:', data);
        setProducts(data);
      } else if (response.status === 401) {
        console.log('Unauthorized, redirecting to login');
        router.push('/login');
      } else {
        console.error('Failed to fetch products:', await response.text());
        setError('Failed to fetch products. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    console.log('SellerProducts component mounted');
    console.log('User:', user);
    console.log('Token:', token);
    if (!user || user.role !== 'seller') {
      console.log('User is not a seller, redirecting to login');
      router.push('/login');
    } else {
      fetchProducts();
    }
  }, [user, fetchProducts, router, token]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        setNewProduct({ name: '', price: '', quantity: '' });
        fetchProducts();
      } else {
        console.error('Failed to add product:', await response.text());
        setError('Failed to add product. Please try again.');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const response = await fetch(`/api/seller/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct),
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        console.error('Failed to edit product:', await response.text());
        setError('Failed to edit product. Please try again.');
      }
    } catch (error) {
      console.error('Failed to edit product:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchProducts();
      } else {
        console.error('Failed to delete product:', await response.text());
        setError('Failed to delete product. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Your Products</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <Input
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
            <Input
              label="Price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
            />
            <Input
              label="Quantity"
              type="number"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              required
            />
            <Button type="submit" color="primary">Add Product</Button>
          </form>
        </CardBody>
      </Card>
      <Table aria-label="Products table">
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Price</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>
                <Button color="primary" size="sm" onClick={() => {
                  setEditingProduct(product);
                  setIsEditModalOpen(true);
                }}>Edit</Button>
                <Button color="danger" size="sm" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Edit Product</ModalHeader>
          <ModalBody>
            {editingProduct && (
              <form onSubmit={handleEditProduct} className="space-y-4">
                <Input
                  label="Product Name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
                <Input
                  label="Price"
                  type="number"
                  value={editingProduct.price.toString()}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Quantity"
                  type="number"
                  value={editingProduct.quantity.toString()}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
                  required
                />
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleEditProduct}>Save Changes</Button>
            <Button color="danger" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
