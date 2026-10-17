"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  Bell,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Business Info
  const [businessName, setBusinessName] = useState("A H Electronics");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  // Contact Info
  const [phone, setPhone] = useState("0306 4006066");
  const [phoneCall, setPhoneCall] = useState("+923064006066");
  const [mobile, setMobile] = useState("0321 4469205");
  const [mobileCall, setMobileCall] = useState("+923214469205");
  const [whatsapp, setWhatsapp] = useState("0323 1469205");
  const [whatsappClean, setWhatsappClean] = useState("923231469205");
  const [whatsappIntl, setWhatsappIntl] = useState("+92 323 1469205");
  const [email, setEmail] = useState("ilyas2030@yahoo.com");
  const [address, setAddress] = useState(
    "345-Lahore Road, Chowk Saddar Bazar, Lahore."
  );

  // Business Hours
  const [weekdays, setWeekdays] = useState("Monday – Saturday: 10:00 AM – 9:00 PM");
  const [weekends, setWeekends] = useState("Sunday: 12:00 PM – 6:00 PM");

  // Social Links
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");

  // Announcements
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || {};
        if (s.businessName) setBusinessName(s.businessName);
        if (s.tagline) setTagline(s.tagline);
        if (s.description) setDescription(s.description);
        if (s.phone) setPhone(s.phone);
        if (s.phoneCall) setPhoneCall(s.phoneCall);
        if (s.mobile) setMobile(s.mobile);
        if (s.mobileCall) setMobileCall(s.mobileCall);
        if (s.whatsapp) setWhatsapp(s.whatsapp);
        if (s.whatsappClean) setWhatsappClean(s.whatsappClean);
        if (s.whatsappIntl) setWhatsappIntl(s.whatsappIntl);
        if (s.email) setEmail(s.email);
        if (s.address) setAddress(s.address);
        if (s.businessHours) {
          setWeekdays(s.businessHours.weekdays || "");
          setWeekends(s.businessHours.weekends || "");
        }
        if (s.social) {
          setFacebook(s.social.facebook || "");
          setInstagram(s.social.instagram || "");
          setYoutube(s.social.youtube || "");
          setTiktok(s.social.tiktok || "");
        }
        if (Array.isArray(s.announcements)) {
          setAnnouncements(s.announcements);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    setAnnouncements([...announcements, newAnnouncement.trim()]);
    setNewAnnouncement("");
  };

  const handleRemoveAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        businessName: businessName.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        phone: phone.trim(),
        phoneCall: phoneCall.trim(),
        mobile: mobile.trim(),
        mobileCall: mobileCall.trim(),
        whatsapp: whatsapp.trim(),
        whatsappClean: whatsappClean.trim(),
        whatsappIntl: whatsappIntl.trim(),
        email: email.trim(),
        address: address.trim(),
        businessHours: {
          weekdays: weekdays.trim(),
          weekends: weekends.trim(),
        },
        social: {
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          youtube: youtube.trim(),
          tiktok: tiktok.trim(),
        },
        announcements,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Website settings updated successfully! Live website refreshed.");
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch {
      toast.error("Network error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#2B2B66]">
            Website Settings & Business Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure store contact information, physical showroom location, business hours, and announcement alerts
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="self-start sm:self-auto px-5 py-2.5 rounded-lg bg-[#62648D] hover:bg-[#0f55bd] text-white text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* ── 1. BUSINESS IDENTITY ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-[#62648D]" />
            <h3 className="font-display text-sm font-bold text-[#2B2B66]">
              Business Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Quality Electronics at Competitive Prices"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Store Description (For About Section & SEO)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
            />
          </div>
        </div>

        {/* ── 2. CONTACT INFORMATION ──────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <h3 className="font-display text-sm font-bold text-[#2B2B66]">
              Contact & WhatsApp Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Phone (Display)
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0306 4006066"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Displayed in the header, footer, and contact page
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Phone Dialing Link (tel:)
              </label>
              <input
                type="text"
                required
                value={phoneCall}
                onChange={(e) => setPhoneCall(e.target.value)}
                placeholder="+923064006066"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Secondary Mobile (Display)
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0321 4469205"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Secondary Mobile Dialing Link (tel:)
              </label>
              <input
                type="text"
                value={mobileCall}
                onChange={(e) => setMobileCall(e.target.value)}
                placeholder="+923214469205"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Number (Display)
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0323 1469205"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clean WhatsApp ID (For wa.me links)
              </label>
              <input
                type="text"
                required
                value={whatsappClean}
                onChange={(e) => setWhatsappClean(e.target.value)}
                placeholder="923231469205"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Target for https://wa.me/923231469205
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ilyas2030@yahoo.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Physical Showroom Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="345-Lahore Road, Chowk Saddar Bazar, Lahore."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── 3. BUSINESS HOURS ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <h3 className="font-display text-sm font-bold text-[#2B2B66]">
              Operating Hours
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Weekdays (Mon – Sat)
              </label>
              <input
                type="text"
                value={weekdays}
                onChange={(e) => setWeekdays(e.target.value)}
                placeholder="Monday – Saturday: 10:00 AM – 9:00 PM"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sundays & Holidays
              </label>
              <input
                type="text"
                value={weekends}
                onChange={(e) => setWeekends(e.target.value)}
                placeholder="Sunday: 12:00 PM – 6:00 PM"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── 4. ANNOUNCEMENT BAR ROTATOR ─────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="font-display text-sm font-bold text-[#2B2B66]">
              Announcement Bar Messages
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Type new rotating announcement..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAnnouncement}
                className="px-4 py-2 bg-[#2B2B66] text-white font-bold rounded-lg hover:bg-slate-800 transition"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 pt-2">
              {announcements.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="text-slate-700">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAnnouncement(idx)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. SOCIAL LINKS ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Share2 className="w-4 h-4 text-cyan-600" />
            <h3 className="font-display text-sm font-bold text-[#2B2B66]">
              Social Media Accounts
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Facebook URL
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/ahelectronics"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instagram URL
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/ahelectronics"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                YouTube URL
              </label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@ahelectronics"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                TikTok URL
              </label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="https://tiktok.com/@ahelectronics"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#62648D] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
