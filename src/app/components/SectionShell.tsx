export const SectionShell = ({
  title,
  children,
  border = "true",
}: {
  title: string;
  children: React.ReactNode;
  border?: string;
}) => (
  <section
    className={`rounded-[6px] bg-none ${
      border === "true" ? "border border-stone-700 p-2" : ""
    }`}
  >
    <h2 className="mb-2 text-base font-medium text-stone-100">{title}</h2>
    {children}
  </section>
);