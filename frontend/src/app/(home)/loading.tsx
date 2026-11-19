/**
 * Khung chờ riêng của trang chủ.
 *
 * Tệp nằm trong nhóm tuyến `(home)` nên chỉ áp dụng cho đường dẫn gốc. Trước đây khung này
 * đặt ở `app/loading.tsx` và chạy cho mọi trang, khiến trang chi tiết sự kiện bị trả về
 * trạng thái 200 kèm nội dung "không tìm thấy" (lỗi mềm 404) vì máy chủ đã gửi phần khung
 * trước khi kịp gọi notFound(). Tách riêng như vậy vừa giữ hiệu ứng chờ cho trang chủ,
 * vừa để các tuyến khác trả đúng mã 404.
 *
 * Bố cục bám sát nội dung thật (khối mở đầu hai cột, dải số liệu và lưới thẻ) để tránh
 * nhảy trang khi dữ liệu đến. Các khối xám dùng vệt sáng chạy ngang.
 */
export default function Loading() {
  return (
    <div className="container-page py-12" role="status" aria-live="polite">
      <span className="sr-only">Đang tải nội dung…</span>

      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="h-5 w-56 shimmer rounded-full bg-raised lg:hidden" />
          <div className="mt-4">
            <div className="h-10 w-full max-w-xl shimmer rounded-xl bg-raised sm:h-[3.4rem] xl:h-[3.8rem]" />
            <div className="mt-2 h-10 w-3/4 max-w-md shimmer rounded-xl bg-raised sm:h-[3.4rem] xl:h-[3.8rem]" />
            {/* Tiêu đề xuống ba dòng ở màn hẹp và ở cột trái hai cột (lg tới xl). */}
            <div className="mt-2 h-10 w-2/3 max-w-sm shimmer rounded-xl bg-raised min-[480px]:hidden sm:h-[3.4rem] xl:h-[3.8rem] lg:block xl:hidden" />
          </div>
          <div className="mt-5 max-w-xl space-y-2">
            <div className="h-[1.35rem] w-full shimmer rounded-full bg-raised sm:h-[1.45rem]" />
            <div className="h-[1.35rem] w-11/12 shimmer rounded-full bg-raised sm:h-[1.45rem]" />
            <div className="h-[1.35rem] w-2/3 shimmer rounded-full bg-raised sm:h-[1.45rem]" />
            {/* Đoạn mở đầu dài thêm ở màn hẹp và ở cột trái hai cột (lg tới xl). */}
            <div className="h-[1.35rem] w-5/6 shimmer rounded-full bg-raised sm:hidden lg:block xl:hidden" />
            <div className="h-[1.35rem] w-1/2 shimmer rounded-full bg-raised sm:hidden" />
          </div>
          <div className="mt-8 max-w-xl">
            <div className="h-6 w-48 shimmer rounded-full bg-raised" />
            <div className="mt-2 h-[3.875rem] w-full shimmer rounded-full bg-raised" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-9 w-20 shimmer rounded-full bg-raised" />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="h-[3.25rem] w-[15.5rem] shimmer rounded-full bg-raised" />
            <div className="h-[3.25rem] w-[11.5rem] shimmer rounded-full bg-raised" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-line bg-surface p-1.5">
            <div className="aspect-[5/4] shimmer rounded-xl bg-raised" />
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface/90 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className={
              'px-5 py-5 sm:px-6 sm:py-6 ' +
              (item > 0 ? 'border-l border-line ' : '') +
              (item >= 2 ? 'border-t border-line sm:border-t-0' : '')
            }
          >
            <div className="h-8 w-16 shimmer rounded-lg bg-raised" />
            <div className="mt-3 h-3.5 w-24 shimmer rounded-full bg-raised" />
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card overflow-hidden">
            <div className="aspect-[16/10] shimmer bg-raised" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-24 shimmer rounded-full bg-raised" />
              <div className="h-6 w-4/5 shimmer rounded-full bg-raised" />
              <div className="h-4 w-full shimmer rounded-full bg-raised" />
              <div className="h-4 w-3/4 shimmer rounded-full bg-raised" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
