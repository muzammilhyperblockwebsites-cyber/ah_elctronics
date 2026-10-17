'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MessageCircle, ShoppingBag, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Product, formatPrice, getDisplayImageUrl, isDirectImage } from '@/lib/products';

interface WhatsAppOrderModalProps {
  product: Product;
  trigger: React.ReactNode;
}

export function WhatsAppOrderModal({ product, trigger }: WhatsAppOrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);

  const resetForm = () => {
    setError('');
    setSubmittedRef(null);
    setSubmittedUrl(null);
    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(resetForm, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanedDigits = phone.replace(/\D/g, '');
    if (cleanedDigits.length < 10) {
      setError('Please enter a valid WhatsApp / mobile number (e.g. 0300 1234567).');
      return;
    }

    if (!consent) {
      setError('Please agree to be contacted regarding your product enquiry.');
      return;
    }

    setLoading(true);

    try {
      const productUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/products/${product.slug}`
          : '';

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          productName: product.name,
          productModel: product.model || '',
          productPrice: product.price || null,
          quantity,
          productUrl,
          productSlug: product.slug,
          productId: product.id,
          message: message.trim(),
          consent,
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : 'Product Modal',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry. Please try again.');
      }

      setSubmittedRef(data.refNumber);
      setSubmittedUrl(data.whatsappUrl);

      // Open WhatsApp in a new tab
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#2B2B66]/60 backdrop-blur-sm z-[80] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[80] w-[92vw] max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl shadow-2xl border border-[#E3E8EF] p-5 sm:p-7 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] overflow-hidden max-h-[92vh] flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E3E8EF]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-[#17212B] leading-tight">
                  Order on WhatsApp
                </Dialog.Title>
                <Dialog.Description className="text-xs text-[#667085]">
                  Direct official booking & enquiry with A H Electronics
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-[#F6F8FB] text-[#667085] transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>

          {submittedRef ? (
            /* Success Screen */
            <div className="py-6 px-2 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#62648D] border border-blue-100 mb-2 font-mono">
                  Reference #{submittedRef}
                </span>
                <h3 className="text-xl font-bold text-[#17212B]">WhatsApp Opened!</h3>
                <p className="text-xs sm:text-sm text-[#667085] max-w-sm mx-auto mt-1">
                  Your order reference has been saved in our system. Please send the prefilled WhatsApp message to confirm availability with our team.
                </p>
              </div>

              {submittedUrl && (
                <a
                  href={submittedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-xs flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all"
                >
                  <MessageCircle size={18} />
                  <span>Click to Re-Open WhatsApp</span>
                  <ExternalLink size={14} />
                </a>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline pt-2"
              >
                Close Window
              </button>
            </div>
          ) : (
            /* Order & Lead Capture Form */
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Product Preview Card */}
              <div className="flex gap-3 p-3 bg-[#F6F8FB] rounded-xl mb-4 border border-[#E3E8EF] flex-shrink-0">
                <div className="relative w-16 h-16 bg-white rounded-lg border border-[#E3E8EF] flex-shrink-0 overflow-hidden">
                  <Image
                    src={getDisplayImageUrl(product.mainImage || '/assets/system/product-image-placeholder.svg')}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                    unoptimized={isDirectImage(product.mainImage || '')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#62648D] uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#17212B] line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-[#667085] font-mono">
                    Model: <span className="text-[#17212B] font-medium">{product.model || 'N/A'}</span>
                  </p>
                  <div className="text-sm font-extrabold text-[#2B2B66] mt-0.5">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Scrollable Form Fields */}
              <div className="overflow-y-auto pr-1 space-y-3 pb-2 flex-1 text-left">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17212B] flex items-center gap-1">
                    <span>Your Full Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D] transition"
                  />
                </div>

                {/* Phone & City Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#17212B] flex items-center gap-1">
                      <span>WhatsApp / Mobile Number</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300 1234567"
                      className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D] transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#17212B]">
                      <span>City</span>
                      <span className="text-[#667085] font-normal text-[11px]"> (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore"
                      className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D] transition"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-semibold text-[#17212B]">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg border border-[#E3E8EF] flex items-center justify-center hover:bg-[#F6F8FB] text-[#17212B] font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-bold text-sm">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(50, quantity + 1))}
                      className="w-8 h-8 rounded-lg border border-[#E3E8EF] flex items-center justify-center hover:bg-[#F6F8FB] text-[#17212B] font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Additional Note */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17212B]">
                    <span>Additional Note</span>
                    <span className="text-[#667085] font-normal text-[11px]"> (Optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Delivery instructions, questions about warranty, invoice, etc."
                    rows={2}
                    className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D] resize-none"
                  />
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-left">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#62648D] focus:ring-[#62648D] w-4 h-4"
                  />
                  <span className="text-[11px] text-[#667085] leading-snug">
                    I agree to be contacted regarding this product enquiry.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-[#E3E8EF] mt-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Saving Enquiry & Preparing WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Proceed to Order on WhatsApp</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] sm:text-[11px] text-[#667085] mt-1.5">
                  Generates an official reference ID and opens WhatsApp with your prefilled order details.
                </p>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
