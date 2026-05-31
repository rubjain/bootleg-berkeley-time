type PageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-10 max-w-4xl rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.72)] px-7 py-8 shadow-[0_24px_80px_rgba(60,55,48,0.08)] backdrop-blur-sm md:px-10">
        {eyebrow ? (
          <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[#8a3f20]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl font-['Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight tracking-[-0.03em] text-[#19212f] md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[#4b5668] md:text-lg">{description}</p>
      </div>
      {children}
    </div>
  );
}
