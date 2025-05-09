'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AccessibleButton from '@/components/ui/AccessibleButton';

export interface ModalProps {
  /**
     * Whether the modal is visible
     */
  isOpen: boolean;

  /**
     * Function to call when the modal should close
     */
  onClose: () => void;

  /**
     * Modal title/header
     */
  title?: string;

  /**
     * Modal content
     */
  children: ReactNode;

  /**
     * Primary action button text
     */
  primaryActionText?: string;

  /**
     * Primary action button handler
     */
  onPrimaryAction?: () => void;

  /**
     * Secondary action button text
     */
  secondaryActionText?: string;

  /**
     * Secondary action button handler
     */
  onSecondaryAction?: () => void;

  /**
     * Whether to automatically focus the first focusable element inside the modal
     * @default true
     */
  autoFocus?: boolean;

  /**
     * Whether to close the modal when the escape key is pressed
     * @default true
     */
  closeOnEscape?: boolean;

  /**
     * Whether to close the modal when clicking the overlay
     * @default true
     */
  closeOnOverlayClick?: boolean;

  /**
     * Additional classes to apply to the modal content container
     */
  contentClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  primaryActionText,
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
  autoFocus = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  contentClassName = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-focus first focusable element
  useEffect(() => {
    if (isOpen && autoFocus && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        setTimeout(() => {
          focusableElements[0].focus();
        }, 50);
      }
    }
  }, [isOpen, autoFocus]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && modalRef.current === e.target) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // The portal will render modal at the document body level
  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        className={`p-8 border rounded bg-white relative ${contentClassName}`}
      >
        {title && (
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {title}
          </h3>
        )}

        <div className="modal-body">
          {children}
        </div>

        {(primaryActionText || secondaryActionText) && (
          <div className="flex justify-center mt-6 gap-4">
            {secondaryActionText && (
              <AccessibleButton
                variant='flat'
                color='secondary'
                onClick={onSecondaryAction || onClose}
              >
                {secondaryActionText}
              </AccessibleButton>
            )}

            {primaryActionText && (
              <AccessibleButton
                variant='solid'
                color='primary'
                onClick={onPrimaryAction}
              >
                {primaryActionText}
              </AccessibleButton>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;