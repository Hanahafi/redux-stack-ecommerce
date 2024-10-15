import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

const Logo: React.FC = () => (
  <div className="flex items-center justify-center">
    <ShoppingCartIcon className="w-8 h-8 text-primary-500" />
    <span className="ml-2 text-2xl font-bold text-gray-800">eCom</span>
  </div>
);

export default Logo;
