import dynamic from 'next/dynamic';
import { Button, Card, CardBody, CardHeader } from '@nextui-org/react';
import Logo from '../components/Logo';

const DynamicLink = dynamic(() => import('next/link'), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="container mx-auto px-4 py-16">
        <Logo />
        <h1 className="text-5xl font-bold text-center mb-12 text-gray-800">Welcome to Our eCommerce Store</h1>
        <div className="flex justify-center space-x-8">
          <Card className="w-96 shadow-xl">
            <CardHeader className="flex justify-center pb-0">
              <h2 className="text-2xl font-semibold">New Customer?</h2>
            </CardHeader>
            <CardBody className="flex flex-col items-center">
              <p className="text-center mb-4">Create an account to get started with your shopping journey!</p>
              <DynamicLink href="/register">
                <Button color="primary" size="lg">Register</Button>
              </DynamicLink>
            </CardBody>
          </Card>
          <Card className="w-96 shadow-xl">
            <CardHeader className="flex justify-center pb-0">
              <h2 className="text-2xl font-semibold">Returning Customer?</h2>
            </CardHeader>
            <CardBody className="flex flex-col items-center">
              <p className="text-center mb-4">Sign in to your account to continue shopping.</p>
              <DynamicLink href="/login">
                <Button color="secondary" size="lg">Login</Button>
              </DynamicLink>
            </CardBody>
          </Card>
        </div>
        <div className="mt-12 text-center">
          <DynamicLink href="/products">
            <Button color="success" size="lg">View Products</Button>
          </DynamicLink>
        </div>
      </div>
    </div>
  );
}
