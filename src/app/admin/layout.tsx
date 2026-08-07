export const metadata = {
  title: "Panel de administrador",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[var(--background)]">{children}</div>;
}
