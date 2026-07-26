import { useEffect, type RefObject } from "react";

// 카드 선택 모달이 열려 있는 동안 배경 화면이 함께 스크롤/바운스되지 않도록 막습니다.
// body만 고정해서는 iOS Safari에서 완전히 막히지 않아, 모달 안(헤더·수트 필터 등
// 카드 그리드 바깥)에서 시작한 터치 스와이프가 뒤 페이지로 새어 나가는 경우가
// 있었습니다. documentElement까지 함께 잠그고, scrollRef로 지정한 영역 밖에서
// 시작한 touchmove는 기본 동작을 막아 스크롤이 그 영역 안에서만 일어나게 합니다.
export function useLockBodyScroll(scrollRef?: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const scrollY = window.scrollY;
    const docEl = document.documentElement;
    const body = document.body;

    const prevDocEl = docEl.style.overflow;
    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    docEl.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    function onTouchMove(e: TouchEvent) {
      const allowed = scrollRef?.current;
      if (!allowed || !(e.target instanceof Node) || !allowed.contains(e.target)) {
        e.preventDefault();
      }
    }
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      docEl.style.overflow = prevDocEl;
      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.left = prevBody.left;
      body.style.right = prevBody.right;
      body.style.width = prevBody.width;
      body.style.overflow = prevBody.overflow;
      window.scrollTo(0, scrollY);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [scrollRef]);
}
