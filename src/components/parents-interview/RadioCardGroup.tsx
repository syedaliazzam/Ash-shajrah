"use client";

import { interviewOptionCardClass } from "@/components/parents-interview/optionCardStyles";

type Option = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  options: readonly Option[] | Option[];
  value?: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
  className?: string;
};

/**
 * Accessible radio-card group sharing the Parents Interview option visual system.
 */
export function RadioCardGroup({
  name,
  options,
  value,
  onChange,
  columns = 2,
  className = "",
}: Props) {
  const gridClass =
    columns === 1
      ? "grid grid-cols-1 gap-3"
      : "grid grid-cols-1 gap-3 min-[380px]:grid-cols-2";

  return (
    <div className={`${gridClass} ${className}`.trim()} role="presentation">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className={interviewOptionCardClass(selected)}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
