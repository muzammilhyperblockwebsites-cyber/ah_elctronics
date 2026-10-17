'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, MessageCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useOrderList } from '@/lib/orderListContext';
import { formatPrice, getDisplayImageUrl, isDirectImage } from '@/lib/products';
import { buildBulkOrderMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import { useSiteSettings } from './SiteChrome';

export function OrderListDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearList } = useOrderList();
  const { settings } = useSiteSettings();
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSendOrder = async () => {
    if (items.length === 0) return;

    const formattedItems = items.map((item) => ({
      name: item.product.name,
      model: item.product.model || 'N/A',
      price: formatPrice(item.product.price),
      quantity: item.quantity,
    }));

    const text = buildBulkOrderMessage(formattedItems, {
      name: customerName.trim() || undefined,
      city: city.trim() || undefined,
      phone: phone.trim() || undefined,
      message: message.trim() || undefined,
      businessName: settings.name,
    });

    const digitsOnly = phone.replace(/\D/g, '');
    if (customerName.trim().length >= 2 && digitsOnly.length >= 10) {
      setSending(true);
      try {
        const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);
        const totalPrice = items.reduce(
          (acc, i) => acc + (i.product.price ? i.product.price * i.quantity : 0),
          0
        );
        const summaryNames = items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ');

        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            productName: items.length === 1 ? items[0].product.name : `Order List (${items.length} items)`,
            productModel: items.map((i) => i.product.model).filter(Boolean).join(', '),
            productPrice: totalPrice > 0 ? totalPrice : null,
            quantity: totalQty,
            productSlug: items[0]?.product.slug || '',
            productId: items[0]?.product.id || null,
            message: `${summaryNames}${message.trim() ? ` | Note: ${message.trim()}` : ''}`,
            consent: true,
            sourcePage: 'Order List Drawer',
          }),
        });
      } catch {
        // Proceed to open WhatsApp even if background lead save fails
      } finally {
        setSending(false);
      }
    }

    const url = getWhatsAppUrl(text, settings.contact.whatsappClean);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[75] overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2B2B66]/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E3E8EF] animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E3E8EF] flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-whatsapp/10 text-whatsapp flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="font-display font-bold text-base sm:text-lg text-[#2B2B66]">
                  WhatsApp Order List
                </h2>
                <p className="text-[11px] text-[#667085]">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white text-[#667085] hover:text-[#17212B] transition-colors"
              aria-label="Close drawer"
            >
              <X size={19} />
            </button>
          </div>

          {/* Notice */}
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-[11px] text-amber-900 leading-tight">
            Final price, stock availability, warranty, and delivery details are confirmed directly on WhatsApp.
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#E3E8EF]/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[#F6F8FB] flex items-center justify-center text-[#667085] mb-3">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-display font-bold text-base text-[#2B2B66] mb-1">
                  Your Order List is Empty
                </h3>
                <p className="text-xs text-[#667085] max-w-xs mb-4">
                  Browse products and click &ldquo;Add to Order List&rdquo; or order individually via WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#62648D] hover:underline"
                >
                  <span>Continue Browsing</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3">
                  <div className="relative w-16 h-16 bg-slate-50 rounded-lg border border-[#E3E8EF] flex-shrink-0 overflow-hidden p-1">
                    <Image
                      src={getDisplayImageUrl(item.product.mainImage || '/assets/system/product-image-placeholder.svg')}
                      alt={item.product.name}
                      fill
                      className="object-contain"
                      sizes="64px"
                      unoptimized={isDirectImage(item.product.mainImage || '')}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#62648D] uppercase tracking-wider">
                      {item.product.brand}
                    </span>
                    <h4 className="text-xs font-semibold text-[#17212B] line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-[#667085] font-mono">
                      {item.product.model || 'N/A'}
                    </p>
                    <p className="text-xs font-bold text-[#2B2B66] mt-0.5">
                      {formatPrice(item.product.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded border border-[#E3E8EF] flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded border border-[#E3E8EF] flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="text-[#667085] hover:text-red-600 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Details & Checkout button (if items exist) */}
          {items.length > 0 && (
            <div className="p-4 border-t border-[#E3E8EF] bg-[#F6F8FB] space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-lg border border-[#E3E8EF] px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#62648D]"
                />
                <input
                  type="tel"
                  placeholder="Phone / WhatsApp (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg border border-[#E3E8EF] px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#62648D]"
                />
              </div>
              <input
                type="text"
                placeholder="City (Optional)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-[#E3E8EF] px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#62648D]"
              />

              <button
                type="button"
                disabled={sending}
                onClick={handleSendOrder}
                className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
                <span>{sending ? 'Saving & Opening WhatsApp...' : 'Send Order List on WhatsApp'}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#667085]">
                <span>Saved locally & synced on send</span>
                <button
                  type="button"
                  onClick={clearList}
                  className="hover:text-red-600 hover:underline"
                >
                  Clear List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
