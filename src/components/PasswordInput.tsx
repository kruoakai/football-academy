"use client";

import { useState, type InputHTMLAttributes, type Ref } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

// Extra input props (name, autoComplete, required, and — notably — the
// onChange/onBlur/ref triple from react-hook-form's register()) all just
// flow through via ...inputProps, so this works both for plain <form
// action> pages (login, reset-password) and react-hook-form-driven forms
// (registration wizard).
export default function PasswordInput({
  id,
  label,
  ref,
  ...inputProps
}: {
  id: string;
  label: string;
  ref?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          ref={ref}
          type={visible ? "text" : "password"}
          className="block min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 py-2 pr-11 text-base focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-400 hover:text-neutral-600"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
