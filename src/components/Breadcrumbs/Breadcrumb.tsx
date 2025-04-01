import Link from "next/link";

interface BreadcrumbProps {
  pageName: string | string[]; // รองรับทั้ง string และ array
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  // แปลงให้กลายเป็น array เสมอ
  const pages = Array.isArray(pageName) ? pageName : [pageName];

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pages[pages.length - 1]} {/* ใช้ตัวสุดท้ายเป็นหัวข้อ */}
      </h2>

      <nav>
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link className="font-medium" href="/">
              Dashboard /
            </Link>
          </li>
          {pages.map((name, index) => {
            const isLast = index === pages.length - 1;
            return (
              <li key={index} className={`font-medium ${isLast ? "text-primary" : ""}`}>
                {!isLast ? (
                  <>
                    {name} <span className="mx-1">/</span>
                  </>
                ) : (
                  name
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
