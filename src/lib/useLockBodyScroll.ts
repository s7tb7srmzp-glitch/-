import { useEffect } from "react";

// 카드 선택 모달이 열려 있는 동안 배경 화면이 함께 스크롤되지 않도록 막습니다.
// 이 처리가 없으면 iOS Safari에서는 모달 안을 스크롤해도 그 제스처가 뒤에 있는
// 페이지로 새어 나가, 카드 그리드는 끝까지 스크롤되지 않으면서 뒷화면만 움직입니다.
export function useLockBodyScroll(): void {
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);
}
