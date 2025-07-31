import { Product } from '@/lib/products';

interface ShoppingCartItemProps {
  product: Product;
  handleQuantityChange: (productId: string, change: number) => void;
  handleRemove: (productId: string) => void;
}

const ShoppingCartItem = ({ product, handleQuantityChange, handleRemove }: ShoppingCartItemProps) => {
  return (
    <div className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0">
      <div className="w-20 h-20 bg-gradient-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45" />
      </div>
      <div>
        <h3 className="text-base font-normal mb-1 tracking-tight">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
        <p className="text-xs text-black mb-3">₩{product.price.toLocaleString()}</p>
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
        <div className="text-lg mb-2 tracking-tight tabular-nums">
          <span>₩{product.price.toLocaleString()}</span>
          {/* 나중에 할인 로직 추가, 이때 할인은 추천아이템 할인, 타임 할인이 있음 */}
          {/* <span className="line-through text-gray-400">₩{product.price}</span> */}
          {/* {product.price !== product.discountPrice && (
            <span className="text-purple-600">₩{product.discountPrice}</span>
          )} */}
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
