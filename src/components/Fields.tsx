"use client";

import { ReactNode } from "react";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="card p-5 sm:p-6">
      <legend className="px-2 text-sm font-bold uppercase tracking-wide text-brand-600">
        {title}
      </legend>
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

function Label({
  htmlFor,
  label,
  required,
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

export function TextField({
  name,
  label,
  required,
  type = "text",
  placeholder,
  hint,
  min,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
  min?: number;
}) {
  return (
    <div>
      <Label htmlFor={name} label={label} required={required} />
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        className="field-input"
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function TextArea({
  name,
  label,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} label={label} required={required} />
      <textarea
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        rows={3}
        className="field-input resize-y"
      />
    </div>
  );
}

export function RadioGroup({
  name,
  label,
  options,
  required,
}: {
  name: string;
  label: string;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <div>
      <Label label={label} required={required} />
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
          >
            <input
              type="radio"
              name={name}
              value={opt}
              required={required}
              className="h-4 w-4 accent-brand-600"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function CheckboxGroup({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}) {
  return (
    <div>
      <Label label={label} />
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
          >
            <input
              type="checkbox"
              name={name}
              value={opt}
              className="h-4 w-4 rounded accent-brand-600"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ScaleField({
  name,
  label,
  min = 0,
  max = 10,
  required,
}: {
  name: string;
  label: string;
  min?: number;
  max?: number;
  required?: boolean;
}) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <Label label={label} required={required} />
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <label
            key={v}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-300 text-sm font-semibold hover:bg-slate-50 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-600 has-[:checked]:text-white"
          >
            <input
              type="radio"
              name={name}
              value={v}
              required={required}
              className="sr-only"
            />
            {v}
          </label>
        ))}
      </div>
    </div>
  );
}
