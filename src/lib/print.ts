// #print-root DOM이 그려진 뒤, 안의 카드 이미지가 전부 로드될 때까지 기다렸다가
// 인쇄 대화상자를 엽니다. 기다리지 않으면 이미지가 빈 칸으로 인쇄될 수 있습니다.
export async function printAfterImagesLoad(): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const root = document.getElementById("print-root");
  const images = root ? Array.from(root.querySelectorAll("img")) : [];
  await Promise.race([
    Promise.all(
      images.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    ),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  window.print();
}
