import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Dreamy Cloud Hoodie',
    price: 68,
    originalPrice: 89,
    description: 'Float through your day in this ultra-soft hoodie that feels like wearing a cloud. Made from organic cotton with a cozy fleece lining.',
    category: 'hoodies',
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['Sky Blue', 'Mint Green', 'Lavender'],
    images: [
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.8,
    reviews: 124,
    isOnSale: true
  },
  {
    id: '2',
    name: 'Sunset Gradient Tee',
    price: 32,
    description: 'Capture the magic of golden hour with this vibrant gradient tee. Perfect for adventures and lazy Sunday mornings.',
    category: 'tshirts',
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['Sunset Orange', 'Pink Coral', 'Yellow Bliss'],
    images: [
      'https://images.pexels.com/photos/7679726/pexels-photo-7679726.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679727/pexels-photo-7679727.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.6,
    reviews: 89
  },
  {
    id: '3',
    name: 'Moonbeam Dress',
    price: 95,
    description: 'Dance under the stars in this ethereal dress that shimmers with every movement. Features a flowing silhouette and delicate details.',
    category: 'dresses',
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['Moonlight Silver', 'Starlight Blue', 'Aurora Pink'],
    images: [
      'https://images.pexels.com/photos/7679728/pexels-photo-7679728.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679729/pexels-photo-7679729.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.9,
    reviews: 156
  },
  {
    id: '4',
    name: 'Adventure Denim Jacket',
    price: 78,
    description: 'Your perfect companion for every adventure. Classic denim with a modern twist and comfortable fit.',
    category: 'jackets',
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['Classic Blue', 'Vintage Wash', 'Light Fade'],
    images: [
      'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679731/pexels-photo-7679731.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.7,
    reviews: 203
  },
  {
    id: '5',
    name: 'Cozy Joggers',
    price: 52,
    description: 'The ultimate comfort meets style. These joggers are perfect for lounging at home or running errands in comfort.',
    category: 'pants',
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['Soft Gray', 'Cream', 'Sage Green'],
    images: [
      'https://images.pexels.com/photos/7679732/pexels-photo-7679732.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679733/pexels-photo-7679733.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.5,
    reviews: 167
  },
  {
    id: '6',
    name: 'Butterfly Crop Top',
    price: 38,
    description: 'Spread your wings with this adorable crop top featuring delicate butterfly prints. Perfect for summer days.',
    category: 'tshirts',
    size: ['XS', 'S', 'M', 'L'],
    color: ['Butterfly Blue', 'Garden Green', 'Petal Pink'],
    images: [
      'https://images.pexels.com/photos/7679734/pexels-photo-7679734.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679735/pexels-photo-7679735.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.4,
    reviews: 92
  }
];

export const categories = [
  { id: 'all', name: 'All Items' },
  { id: 'hoodies', name: 'Hoodies' },
  { id: 'tshirts', name: 'T-Shirts' },
  { id: 'dresses', name: 'Dresses' },
  { id: 'jackets', name: 'Jackets' },
  { id: 'pants', name: 'Pants' }
];