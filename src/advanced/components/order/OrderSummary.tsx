const OrderSummary = () => {
  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3">
          <div className="flex justify-between text-xs tracking-wide text-gray-400">
            <span>버그 없애는 키보드 x 1</span>
            <span>₩8,000</span>
          </div>

          <div className="flex justify-between text-xs tracking-wide text-gray-400">
            <span>생산성 폭발 마우스 x 1</span>
            <span>₩15,200</span>
          </div>

          <div className="flex justify-between text-xs tracking-wide text-gray-400">
            <span>거북목 탈출 모니터암 x 1</span>
            <span>₩22,800</span>
          </div>

          <div className="flex justify-between text-xs tracking-wide text-gray-400">
            <span>코딩할 때 듣는 Lo-Fi 스피커 x 1</span>
            <span>₩19,000</span>
          </div>

          <div className="border-t border-white/10 my-3"></div>
          <div className="flex justify-between text-sm tracking-wide">
            <span>Subtotal</span>
            <span>₩65,000</span>
          </div>

          <div className="flex justify-between text-sm tracking-wide text-gray-400">
            <span>Shipping</span>
            <span>Free</span>
          </div>
        </div>
        <div className="mt-auto">
          <div id="discount-info" className="mb-4"></div>
          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">₩65,000</div>
            </div>
            <div id="loyalty-points" className="text-xs text-blue-400 mt-2 text-right block">
              <div>
                적립 포인트: <span className="font-bold">215p</span>
              </div>
              <div className="text-2xs opacity-70 mt-1">기본: 65p, 키보드+마우스 세트 +50p, 풀세트 구매 +100p</div>
            </div>
          </div>
          <div id="tuesday-special" className="mt-4 p-3 bg-white/10 rounded-lg hidden">
            <div className="flex items-center gap-2">
              <span className="text-2xs">🎉</span>
              <span className="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
            </div>
          </div>
        </div>
      </div>
      <button className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
        Proceed to Checkout
      </button>
      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.
        <br />
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    </div>
  );
};

export default OrderSummary;
