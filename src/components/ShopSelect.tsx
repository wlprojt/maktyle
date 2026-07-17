"use client";

type ShopSelectProps = {
  name: string;
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
};

export default function ShopSelect({
  name,
  defaultValue,
  children,
  className,
}: ShopSelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(event) => {
        event.currentTarget.form?.requestSubmit();
      }}
      className={className}
    >
      {children}
    </select>
  );
}