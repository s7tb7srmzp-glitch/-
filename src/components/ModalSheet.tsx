import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

// 카드 선택 시트의 공통 껍데기입니다.
//
// 반드시 document.body로 포털해서 띄웁니다. 이 앱은 <main>이 스크롤 컨테이너인데
// (global.css에서 html·body는 overflow:hidden), iOS Safari에서는 overflow-y:auto +
// -webkit-overflow-scrolling:touch가 걸린 요소가 position:fixed 자식의 컨테이닝 블록이
// 되어버립니다. 그래서 <main> 안에서 모달을 띄우면 시트가 <main> 영역에 갇혀
// 아래쪽(하단 탭 뒤)이 잘려 보이고 카드 끝까지 스크롤되지 않았습니다.
//
// 또 모달이 열려 있는 동안에는 실제로 스크롤되는 <main>을 잠가야 뒷화면이 함께
// 움직이지 않습니다. body를 잠그는 것은 이 앱에서는 아무 효과가 없습니다.
export function ModalSheet({
  onClose,
  scrollRef,
  children,
}: {
  onClose: () => void;
  /** 시트 안에서 유일하게 스크롤을 허용할 영역 (카드 그리드) */
  scrollRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // overflow(단축 속성)로 껐다 켜면 안 됩니다. <main>은 React가 overflowY만
    // 인라인으로 지정하는데, 단축 속성에 값을 대입하면 overflow-x·overflow-y
    // 롱핸드가 함께 덮어써지고, 복원 시 style.overflow = ""로 되돌려도 그
    // 롱핸드들이 지워질 뿐 "auto"로 되돌아가지 않습니다. React는 자기가 마지막에
    // 넘긴 overflowY 값("auto")이 안 바뀌었다고 보고 다시 적용하지 않기 때문에,
    // 모달을 한 번이라도 열었다 닫으면 <main>이 영영 스크롤되지 않는 버그였습니다.
    const scroller = document.querySelector("main");
    const prevOverflowY = scroller?.style.overflowY ?? "";
    if (scroller) scroller.style.overflowY = "hidden";

    // 그리드 밖(시트 헤더·수트 칩·배경)에서 시작한 터치 스크롤은 막아, 스크롤이
    // 카드 그리드 안에서만 일어나게 합니다.
    function onTouchMove(e: TouchEvent) {
      const allowed = scrollRef.current;
      if (!allowed || !(e.target instanceof Node) || !allowed.contains(e.target)) {
        e.preventDefault();
      }
    }
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      if (scroller) scroller.style.overflowY = prevOverflowY;
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [scrollRef]);

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-end",
        zIndex: 100,
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        style={{
          background: "var(--color-bg-elevated)",
          width: "100%",
          maxHeight: "85dvh",
          borderRadius: "20px 20px 0 0",
          padding: "16px 16px calc(16px + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
