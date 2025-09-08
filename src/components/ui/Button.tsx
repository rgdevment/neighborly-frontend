import clsx from 'clsx';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const getVariantStyles = (variant: ButtonProps['variant']) => {
  switch (variant) {
    case 'primary':
      return 'bg-primary text-white hover:bg-primary-hover focus:ring-primary';
    case 'secondary':
      return 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary';
    default:
      return 'bg-primary text-white hover:bg-primary-hover focus:ring-primary';
  }
};

export default function Button({ children, className, variant = 'primary', ...props }: Readonly<ButtonProps>) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <button className={clsx(baseStyles, getVariantStyles(variant), className)} {...props}>
      {children}
    </button>
  );
}
