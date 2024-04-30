import React, {
  useRef,
  useContext,
  createContext,
  type ReactNode,
} from 'react';
import { OktoBottomSheet } from './OktoBottomSheet';
import { RnOktoSdk } from '../OktoWallet';
import type { BottomSheetType } from '../types';

export interface SheetContextType {
  showBottomSheet: (screen: BottomSheetType) => void;
  closeBottomSheet: () => void;
}

const SheetContext = createContext<SheetContextType | null>(null);

export const OktoBottomSheetProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const oktoBottomSheetRef = useRef<any>(null);

  const showBottomSheet = (screen: BottomSheetType) => {
    if (RnOktoSdk.isLoggedIn()) {
      oktoBottomSheetRef.current?.openSheet(screen);
    } else {
      console.error('user not logged in');
    }
  };

  const closeBottomSheet = () => {
    oktoBottomSheetRef.current?.closeSheet();
  };

  return (
    <SheetContext.Provider value={{ showBottomSheet, closeBottomSheet }}>
      {children}
      <OktoBottomSheet ref={oktoBottomSheetRef} />
    </SheetContext.Provider>
  );
};

export const useOktoBottomSheet = () => useContext(SheetContext);
