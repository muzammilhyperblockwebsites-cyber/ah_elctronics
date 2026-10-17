"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getWhatsAppUrl, buildContactMessage } from "@/lib/whatsapp";
import { useSiteSettings } from "./SiteChrome";

export function ContactForm() {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digitsOnly = formData.phone.replace(/\D/g, "");

    if (digitsOnly.length >= 10) {
      setLoading(true);
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: formData.name.trim(),
            phone: formData.phone.trim(),
            city: formData.city.trim(),
            productName: "General Inquiry",
            message: formData.message.trim(),
            consent: true,
            sourcePage: "/contact",
          }),
        });
        const data = await res.json();
        if (res.ok && data.whatsappUrl) {
          setSubmittedRef(data.refNumber);
          window.open(data.whatsappUrl, "_blank");
          return;
        } else if (!res.ok) {
          setError(data.error || "Could not submit inquiry.");
          return;
        }
      } catch {
        // Fallback to direct WhatsApp if network fails
      } finally {
        setLoading(false);
      }
    }

    const msg = buildContactMessage({
      ...formData,
      businessName: settings.name,
    });
    window.open(getWhatsAppUrl(msg, settings.contact.whatsappClean), "_blank");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {submittedRef && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Inquiry saved (Ref #{submittedRef}) and opened in WhatsApp!</span>
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          placeholder="Muhammad Ali"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-navy mb-1">
            Phone / WhatsApp Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="0300 1234567"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-navy mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="Lahore"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-navy mb-1">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y text-sm"
          placeholder="How can we help you?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-60 text-sm sm:text-base"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        <span>{loading ? "Saving & Opening WhatsApp..." : "Send via WhatsApp"}</span>
      </button>
    </form>
  );
}
