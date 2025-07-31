import ShoppingCartItem from '@/components/cart/ShoppingCartItem';
import { Product } from '@/lib/products';

import ProductPicker from './ProductPicker';

interface ShoppingCartProps {
  selectedProducts: Product[];
  handleAddToCartProduct: (productId: string) => void;
  handleQuantityChange: (productId: string, change: number) => void;
  handleRemoveItem: (productId: string) => void;
}

const ShoppingCart = ({
  selectedProducts,
  handleAddToCartProduct,
  handleQuantityChange,
  handleRemoveItem,
}: ShoppingCartProps) => {
  return (
    <div className="bg-white border border-gray-200 p-8 overflow-y-auto">
      <ProductPicker selectedProducts={selectedProducts} handleAddToCartProduct={handleAddToCartProduct} />
      <div id="cart-items">
        {selectedProducts.map((product) => (
          <ShoppingCartItem
            key={product.id}
            product={product}
            handleQuantityChange={handleQuantityChange}
            handleRemove={handleRemoveItem}
          />
        ))}
      </div>
    </div>
  );
};

export default ShoppingCart;
