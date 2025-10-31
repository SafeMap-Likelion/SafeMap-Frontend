import SelectLocationAuth from "@/features/auth/components/SelectLocationAuth";
import { useSelectLocationStore } from "@/stores/useSelectLocationStore";
import React, { useEffect } from "react";

export default function SelectLocationPageAuth() {
  const { setIsAuthPage } = useSelectLocationStore();

  useEffect(() => {
    // 페이지가 마운트될 때 무조건 true로 설정
    setIsAuthPage(true);
  }, [setIsAuthPage]);

  return <SelectLocationAuth />;
}
