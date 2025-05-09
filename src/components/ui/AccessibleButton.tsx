'use client';

import React, { KeyboardEvent, MouseEvent, forwardRef, useRef } from 'react';
import { Button, ButtonProps } from '@nextui-org/button';

export type AccessibleButtonProps = ButtonProps & {
  /**
   * Whether to trigger the button on Enter key press when focused
   * @default true
   */
  triggerOnEnter?: boolean;
};

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      triggerOnEnter = true,
      onClick,
      type,
      ...props
    },
    ref
  ) => {
    const isProcessingEvent = useRef(false);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (!isProcessingEvent.current) {
        onClick?.(e);
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' && triggerOnEnter && type !== 'submit') {
        e.preventDefault();

        if (isProcessingEvent.current) {
          return;
        }

        isProcessingEvent.current = true;

        if (onClick) {
          const syntheticEvent = {
            currentTarget: e.currentTarget,
            target: e.target,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation(),
            isSyntheticEvent: true,
          } as unknown as MouseEvent<HTMLButtonElement>;

          onClick(syntheticEvent);
        }

        setTimeout(() => {
          isProcessingEvent.current = false;
        }, 100);
      }
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        type={type}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;