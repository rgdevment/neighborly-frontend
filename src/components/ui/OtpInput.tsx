'use client';

import React from 'react';
import OtpInputLibrary from 'react-otp-input';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
}

const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  ({ value, onChange, numInputs = 6 }, ref) => {
    return (
      <div ref={ref} className="flex justify-center">
        <OtpInputLibrary
          value={value}
          onChange={onChange}
          numInputs={numInputs}
          renderInput={(props, index) => (
            <input
              {...props}
              key={index}
              className="!w-12 h-14 mx-1 rounded-lg border border-neutral-500/30 text-center text-xl focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}
        />
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';

export default OtpInput;
