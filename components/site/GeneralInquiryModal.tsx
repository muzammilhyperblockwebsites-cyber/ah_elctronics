'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MessageCircle, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface GeneralInquiryModalProps {
  trigger: React.ReactNode;
}

export function GeneralInquiryModal({ trigger }: GeneralInquiryModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
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
      setError('Please enter a valid WhatsApp or mobile number (e.g. 0300 1234567).');
      return;
    }

    if (!consent) {
      setError('Please agree to be contacted regarding your enquiry.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          productName: 'General Inquiry',
          message: message.trim(),
          consent,
          sourcePage: typeof window !== 'undefined' ? `${window.location.pathname} (Floating Button)` : 'Floating WhatsApp Button',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send enquiry. Please try again.');
      }

      setSubmittedRef(data.refNumber);
      setSubmittedUrl(data.whatsappUrl);

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#2B2B66]/60 backdrop-blur-sm z-[80] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[80] w-[92vw] max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl shadow-2xl border border-[#E3E8EF] p-5 sm:p-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[92vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E3E8EF] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-[#17212B] leading-tight">
                  Direct WhatsApp Help
                </Dialog.Title>
                <Dialog.Description className="text-xs text-[#667085]">
                  A H Electronics official customer support
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-[#F6F8FB] text-[#667085] transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>

          {submittedRef ? (
            /* Success State */
            <div className="py-6 text-center space-y-4 overflow-y-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#62648D] border border-blue-100 font-mono mb-1.5">
                  Enquiry #{submittedRef}
                </span>
                <h3 className="text-lg font-bold text-[#17212B]">WhatsApp Chat Ready!</h3>
                <p className="text-xs text-[#667085] max-w-xs mx-auto mt-1">
                  Your reference has been generated. Continue in WhatsApp to chat with our Saddar Bazar store team.
                </p>
              </div>

              {submittedUrl && (
                <a
                  href={submittedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white py-2.5 px-4 rounded-xl font-bold text-sm shadow transition-all"
                >
                  <MessageCircle size={17} />
                  <span>Open WhatsApp</span>
                  <ExternalLink size={13} />
                </a>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto pt-1"
              >
                Close Window
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left overflow-y-auto pr-1 flex-1">
              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                  placeholder="e.g. Usman Tariq"
                  className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17212B] flex items-center gap-1">
                    <span>Phone / WhatsApp</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0323-1469205"
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
                    placeholder="Lahore, etc."
                    className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17212B]">
                  <span>Message / Question</span>
                  <span className="text-[#667085] font-normal text-[11px]"> (Optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about products, showroom location, brand warranty or installments..."
                  rows={2}
                  className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#62648D]/20 focus:border-[#62648D] resize-none"
                />
              </div>

              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
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

              <div className="pt-3 border-t border-[#E3E8EF]">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      <span>Connecting WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={17} />
                      <span>Start WhatsApp Conversation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
