import clsx from 'clsx';
import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: Readonly<CardProps>) {
  const cardClasses = clsx(
    'bg-neutral-50',
    'rounded-lg',
    'border border-neutral-100',
    'p-8',
    'shadow-md',
    className,
  );

  return <div className={cardClasses}>{children}</div>;
}
