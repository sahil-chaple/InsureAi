import { createFileRoute } from "@tanstack/react-router";
import { Card, Input, Button, Toggle } from "@/components/ui-kit";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({ component: SettingsPage });

function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [notifs, setNotifs] = useState({ email: true, sms: false, push: true });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <div className="space-y-4">
        <Card>
          <h3 className="mb-4 font-semibold">Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" defaultValue={user?.name || ""} />
            <Input label="Email" defaultValue={user?.email || ""} />
            <Input label="Phone" placeholder="+91 98XXX XX521" />
            <Input label="Date of birth" type="date" />
          </div>
          <Button className="mt-5" onClick={() => toast.success("Profile updated")}>Save changes</Button>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Notifications</h3>
          <div className="space-y-3">
            {(["email", "sms", "push"] as const).map((k) => (
              <div key={k} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium capitalize">{k} notifications</div>
                  <div className="text-xs text-muted-foreground">Get updates about your policy & claims</div>
                </div>
                <Toggle checked={notifs[k]} onChange={(v) => setNotifs({ ...notifs, [k]: v })} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold">Danger zone</h3>
          <p className="mb-4 text-sm text-muted-foreground">Cancel your active policy (requires confirmation).</p>
          <Button variant="danger" onClick={() => toast.error("Cancellation requires confirmation modal (demo)")}>Cancel policy</Button>
        </Card>
      </div>
    </div>
  );
}
