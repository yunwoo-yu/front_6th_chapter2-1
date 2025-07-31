import { Product } from '@/lib/products';
import { getPriceDisplay, getSaleIcon } from '@/utils/priceUtils';

interface ShoppingCartItemProps {
  product: Product;
  handleQuantityChange: (productId: string, change: number) => void;
  handleRemove: (productId: string) => void;
}

const ShoppingCartItem = ({ product, handleQuantityChange, handleRemove }: ShoppingCartItemProps) => {
  // 10개 이상일 때 볼드 처리
  const shouldBeBold = product.quantity >= 10;

  return (
    <div className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0">
      <div className="w-20 h-20 bg-gradient-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45" />
      </div>
      <div>
        <h3 className="text-base font-normal mb-1 tracking-tight">
          {getSaleIcon(product)}
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
        <p className={`text-xs text-black mb-3 ${shouldBeBold ? 'font-bold' : ''}`}>{getPriceDisplay(product)}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleQuantityChange(product.id, -1)}
            className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
          >
            -
          </button>
          <span>{product.quantity}</span>
          <button
            onClick={() => handleQuantityChange(product.id, 1)}
            className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
          >
            +
          </button>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-lg mb-2 tracking-tight tabular-nums ${shouldBeBold ? 'font-bold' : ''}`}>
          {getPriceDisplay(product)}
        </div>
        <button
          onClick={() => handleRemove(product.id)}
          className="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default ShoppingCartItem;
