'use client';

import React, { KeyboardEvent, forwardRef } from 'react';
import { Button, ButtonProps } from '@nextui-org/button';

export type AccessibleButtonProps = ButtonProps & {
  /**
     * Whether to trigger the button on Enter key press when focused
     * @default true
     */
  triggerOnEnter?: boolean;

  /**
     * Whether to trigger the button on Space key press when focused
     * @default true
     */
  triggerOnSpace?: boolean;
};

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      triggerOnEnter = true,
      triggerOnSpace = true,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (
        (triggerOnEnter && e.key === 'Enter') ||
                (triggerOnSpace && e.key === ' ')
      ) {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        onClick?.(e as any);
      }
    };

    return (
      <Button
        ref={ref}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;