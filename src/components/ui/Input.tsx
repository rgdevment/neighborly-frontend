import clsx from 'clsx';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={clsx('w-full', className)}>
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-neutral-900"
        >
          {label}
        </label>
        <input
          ref={ref}
          className={clsx(
            'mt-1 block w-full rounded-lg border border-neutral-500/30 bg-white px-3 py-2 shadow-sm',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            {
              'border-red-500 focus:border-red-500 focus:ring-red-500': error,
            },
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
