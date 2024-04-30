import React, {
  useRef,
  useContext,
  createContext,
  type ReactNode,
} from 'react';
import { OktoBottomSheet } from './OktoBottomSheet';
import { RnOktoSdk } from '../OktoWallet';

export interface SheetContextType {
  showBottomSheet: () => void;
  closeBottomSheet: () => void;
}

const SheetContext = createContext<SheetContextType | null>(null);

export const OktoBottomSheetProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const oktoBottomSheetRef = useRef<any>(null);

  const showBottomSheet = () => {
    if (RnOktoSdk.isLoggedIn()) {
      oktoBottomSheetRef.current?.openSheet();
    }
    else {
      console.error('user not logged in');
    }
  };

  const closeBottomSheet = () => {
    oktoBottomSheetRef.current?.closeSheet();
  };

  return (
    <SheetContext.Provider value={{ showBottomSheet, closeBottomSheet }}>
      {children}
      <OktoBottomSheet isVisible={false} ref={oktoBottomSheetRef} />
    </SheetContext.Provider>
  );
};

export const useOktoBottomSheet = () => useContext(SheetContext);
