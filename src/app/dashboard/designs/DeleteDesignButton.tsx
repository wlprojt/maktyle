"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Trash2 size={17} />
      )}
    </button>
  );
}

export default function DeleteDesignButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form action={action}>
      <SubmitButton />
    </form>
  );
}