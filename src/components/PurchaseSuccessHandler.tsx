'use client';

import { PurchaseSuccessModal, usePurchaseDetection } from './PurchaseSuccessModal';

export const PurchaseSuccessHandler = () => {
  const { showModal, planType, handleClose } = usePurchaseDetection();

  return <PurchaseSuccessModal isOpen={showModal} onClose={handleClose} planType={planType} />;
};

