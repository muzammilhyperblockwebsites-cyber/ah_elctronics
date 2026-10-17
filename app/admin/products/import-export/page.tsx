"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ImportExportPage() {
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);

  const handleExport = (format: "json" | "csv") => {
    window.location.href = `/api/admin/export?format=${format}`;
    toast.success(`Exporting products as ${format.toUpperCase()}...`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a JSON or CSV file to import.");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Import completed successfully!");
        setImportResult(data.stats);
        setSelectedFile(null);
      } else {
        toast.error(data.error || "Failed to process import file.");
      }
    } catch {
      toast.error("Network error during file import.");
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCsv = () => {
    const sample = `Name,Model,Brand,Category,Subcategory,Price,StockStatus,MainImage,Featured,SpecialOffer,Warranty,ShortDescription
"HSU-18HFP Inverter 1.5 Ton","HSU-18HFP","Haier","Air Conditioners","Inverter Split",165000,"In Stock","/assets/system/product-image-placeholder.webp",true,false,"10 Years Compressor","High efficiency DC inverter"
"91999 Avante Refrigerator","91999","Dawlance","Refrigerators","Double Door",128000,"In Stock","/assets/system/product-image-placeholder.webp",false,true,"12 Years Compressor","Hybrid cooling technology"`;

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample-ah-electronics-import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-[#2B2B66]">
            Bulk Products Import & Export
          </h1>
          <p className="text-xs text-slate-500">
            Export the entire live database or bulk import catalog spreadsheets and JSON feeds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── EXPORT CARD ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#62648D] flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="font-display text-base font-bold text-[#2B2B66]">
              Export Products Catalog
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download all products currently in the database. You can export in standard spreadsheet format (CSV) or developer JSON format for backups and migration.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleExport("csv")}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-slate-800 text-xs font-bold transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export as CSV Spreadsheet</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </button>

            <button
              onClick={() => handleExport("json")}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 text-slate-800 text-xs font-bold transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-[#62648D]" />
                <span>Export as JSON Data Feed</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-[#62648D] transition" />
            </button>
          </div>
        </div>

        {/* ── IMPORT CARD ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#2B2B66]">
                Import Products
              </h2>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="text-[11px] text-[#62648D] hover:underline font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Sample CSV</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a `.csv` or `.json` file containing products. Existing items matching the model and brand will be updated, and new items will be created safely.
            </p>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-4 pt-4 border-t border-slate-100">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
              <input
                type="file"
                accept=".csv, application/json, .json"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={importing}
              />
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              {selectedFile ? (
                <div className="text-xs">
                  <p className="font-bold text-[#2B2B66]">{selectedFile.name}</p>
                  <p className="text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-[#62648D]">Click to choose file</span>{" "}
                  or drag & drop
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports CSV or JSON</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedFile || importing}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2B2B66] hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing file & database...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Bulk Import</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── IMPORT RESULT SUMMARY ─────────────────────────────────── */}
      {importResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-800">
                Bulk Import Summary
              </h3>
              <p className="text-xs text-slate-500">The uploaded file was processed successfully</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Processed</p>
              <p className="text-xl font-extrabold text-[#2B2B66] mt-1">
                {importResult.total}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-600 uppercase font-semibold">New Products Added</p>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                {importResult.inserted}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 uppercase font-semibold">Existing Updated</p>
              <p className="text-xl font-extrabold text-[#62648D] mt-1">
                {importResult.updated}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[#62648D] hover:underline"
            >
              Go to Products Catalog →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
