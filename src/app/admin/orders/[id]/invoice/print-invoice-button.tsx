"use client";

import {
  Download,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function PrintInvoiceButton({
  invoiceNumber,
}: {
  invoiceNumber: string;
}) {
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    setLoading(true);

    const previousTitle = document.title;
    document.title = `${invoiceNumber}-invoice`;

    window.setTimeout(() => {
      window.print();
      document.title = previousTitle;
      setLoading(false);
    }, 150);
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#7440d0] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />
          Preparing...
        </>
      ) : (
        <>
          <Download size={18} />
          Download invoice
        </>
      )}
    </button>
  );
}