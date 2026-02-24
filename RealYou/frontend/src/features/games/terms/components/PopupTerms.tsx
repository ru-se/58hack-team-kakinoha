'use client';

import TermsContent from './TermsContent';
import type { FC } from 'react';

interface PopupTermsProps {
  onCheckboxChange: (
    key: 'readConfirm' | 'mailMagazine' | 'thirdPartyShare',
    checked: boolean
  ) => void;
  onHiddenInputChange: (value: string) => void;
  checkboxStates: Record<
    'readConfirm' | 'mailMagazine' | 'thirdPartyShare',
    boolean
  >;
  hiddenInputValue: string;
  setScrollContainerRef?: (el: HTMLDivElement | null) => void;
  onScroll?: () => void;
  onAction?: (action: 'agree' | 'disagree') => void;
  onAgreeHoverStart?: () => void;
}

const PopupTerms: FC<PopupTermsProps> = ({
  onCheckboxChange,
  onHiddenInputChange,
  checkboxStates,
  hiddenInputValue,
  setScrollContainerRef,
  onScroll,
  onAction,
  onAgreeHoverStart,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="relative mx-4 w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* スクロール領域 */}
        <div
          ref={(el) => {
            if (setScrollContainerRef)
              setScrollContainerRef(el as HTMLDivElement | null);
          }}
          onScroll={() => {
            if (onScroll) onScroll();
          }}
          className="mt-6 max-h-[70vh] overflow-y-auto px-2"
        >
          <TermsContent
            onCheckboxChange={onCheckboxChange}
            onHiddenInputChange={onHiddenInputChange}
            checkboxStates={checkboxStates}
            hiddenInputValue={hiddenInputValue}
          />
        </div>

        {/* アクションボタン領域 */}
        <div className="border-t bg-white px-4 py-3">
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-3">
            <button
              onClick={() => onAction && onAction('disagree')}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              同意しない
            </button>
            <button
              onClick={() => onAction && onAction('agree')}
              onMouseEnter={() => onAgreeHoverStart && onAgreeHoverStart()}
              className="rounded bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              同意する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupTerms;
