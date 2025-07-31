import ShoppingCart from './components/cart/ShoppingCart';
import GuideToggle from './components/guide/GuideToggle';
import Header from './components/layout/Header';
import Layout from './components/layout/Layout';
import OrderSummary from './components/order/OrderSummary';
import { useCart } from './hooks/useCart';

export default function App() {
  const { selectedProducts, handleAddToCartProduct, handleQuantityChange, handleRemoveItem } = useCart();

  return (
    <>
      <Header />
      <GuideToggle />
      <Layout>
        <ShoppingCart
          selectedProducts={selectedProducts}
          handleAddToCartProduct={handleAddToCartProduct}
          handleQuantityChange={handleQuantityChange}
          handleRemoveItem={handleRemoveItem}
        />
        <OrderSummary selectedProducts={selectedProducts} />
      </Layout>
    </>
  );
}
