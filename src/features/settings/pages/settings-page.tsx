import { Monitor, Palette, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/features/shared/components";
import { useSettingsPageModel } from "@/features/settings/page-models/use-settings-page-model";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const model = useSettingsPageModel();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Review workspace mode, authentication source, and visual preferences."
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <SectionHeader icon={Palette} title="Appearance" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {model.themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={option.select}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 text-left transition-smooth",
                    option.active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <SectionHeader icon={Monitor} title="Workspace" />
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Signed in as" value={model.signedInAs} />
            <Row label="Backend mode" value={model.backendMode} />
            <Row label="Product" value={model.productName} />
          </dl>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
