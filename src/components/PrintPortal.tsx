import { type ReactNode } from "react";
import { createPortal } from "react-dom";

// PDF 내보내기는 브라우저 기본 인쇄(다른 이름으로 저장 → PDF)를 그대로 씁니다.
// 새 라이브러리를 추가하지 않고도 한글이 정확히 렌더링되고 카드 이미지도
// 그대로 포함되기 때문입니다(jsPDF 등은 한글 폰트를 직접 심어야 해서 훨씬
// 복잡하고 용량도 커집니다).
//
// #print-root는 평소에는 display:none이라 화면에 보이지 않고, 인쇄할 때만
// (global.css의 @media print 규칙으로) 화면의 나머지 부분을 모두 숨기고
// 이 요소만 보여줍니다. document.body로 포털해서 #root의 고정 레이아웃
// (height:100dvh, overflow:hidden)의 영향을 받지 않게 합니다.
export function PrintPortal({ children }: { children: ReactNode }) {
  return createPortal(<div id="print-root">{children}</div>, document.body);
}
