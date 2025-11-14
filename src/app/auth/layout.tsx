import { Logo } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2 mb-8">
            <Logo className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold tracking-tight text-foreground">
              AgoraMedAI
            </span>
          </div>
      {children}
    </div>
  );
}
