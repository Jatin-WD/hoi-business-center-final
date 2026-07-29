import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { apiClient } from "@/lib/api-client";
import { PAGE_GROUPS, RESOURCE_LABELS, blankResource, normalizeDashboardData, type DashboardData, type ResourceKey, type Row } from "./admin-dashboard/shared";
import { ErrorState, InlineFeedback, LoadingState, safeJson } from "./admin-dashboard/common";
import { AdminHeader, AdminSidebar, AdminUsersPanel, ManpowerPanel, NotificationsPanel, Overview, PageContentPanel, RequirementsPanel, ResourceManager, SettingsPanel, ThemePanel, UsersPanel } from "./admin-dashboard/sections";
export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [active, setActive] = useState("overview");
  const [activePage, setActivePage] = useState(PAGE_GROUPS[0].id);
  const [selected, setSelected] = useState<Row | null>(null);
  const [resourceDrafts, setResourceDrafts] = useState<Record<string, Row>>({});
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [replyDraft, setReplyDraft] = useState({ source: "", id: "", subject: "Reply from HOI Business Center", message: "" });
  const [adminDraft, setAdminDraft] = useState<Row>({ name: "", email: "", phone: "", company: "", role: "editor", password: "" });
  const [passwordDraft, setPasswordDraft] = useState({ currentPassword: "", newPassword: "" });
  const adminToken = () => sessionStorage.getItem("hoi_admin_token") || "";
  const load = async () => {
    const token = adminToken();
    if (!token) return setLocation("/admin-login");
    try {
      setLoadError("");
      const response = await apiClient.getAdminDashboard(token);
      setData(normalizeDashboardData(response.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load admin dashboard";
      if (/admin login required|invalid admin session|invalid token|jwt/i.test(message)) {
        sessionStorage.removeItem("hoi_admin_token");
        setLocation("/admin-login");
        return;
      }
      setLoadError(message);
      throw new Error(message);
    }
  };
  useEffect(() => {
    load()
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load admin dashboard");
      })
      .finally(() => setLoading(false));
  }, [setLocation]);
  const contentMap = useMemo(() => Object.fromEntries((data?.content ?? []).map((item) => [item.content_key, item])), [data]);
  const currentResource = (["services", "packages", "venues", "events"].includes(active) ? active : "services") as ResourceKey;
  const resourceRows = (data?.[currentResource] ?? []).filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const currentDraft = resourceDrafts[currentResource] ?? blankResource(currentResource);
  const runAction = async (action: () => Promise<void>, success: string) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await action();
      await load();
      setNotice(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSaving(false);
    }
  };
  const savePageField = async (key: string, value: string) => {
    await runAction(() => apiClient.saveCmsContent(adminToken(), {
      contentKey: key, label: key.split(".").join(" "), value, type: "text",
    }), "Page content saved");
  };
  const saveResource = async (event: FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      await apiClient.saveAdminResource(adminToken(), currentResource, currentDraft, currentDraft.id);
      setResourceDrafts((prev) => ({ ...prev, [currentResource]: blankResource(currentResource) }));
      setSelected(null);
    }, `${RESOURCE_LABELS[currentResource].title} saved`);
  };
  const saveTheme = async (theme: Row) => {
    await runAction(async () => {
      for (const key of ["primary", "primaryDark", "accent", "accentText"]) {
        await apiClient.saveCmsContent(adminToken(), {
          contentKey: `theme.${key}`,
          label: `Theme ${key}`,
          value: theme[key],
          type: "color",
        });
      }
    }, "Theme updated");
  };
  const saveAdminUser = async (event: FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      await apiClient.saveAdminUser(adminToken(), adminDraft, adminDraft.id);
      setAdminDraft({ name: "", email: "", phone: "", company: "", role: "editor", password: "" });
    }, "Admin access saved");
  };
  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      await apiClient.changeAdminPassword(adminToken(), passwordDraft);
      setPasswordDraft({ currentPassword: "", newPassword: "" });
    }, "Password changed");
  };
  const submissionAction = async (source: string, id: string | number, action: "delete" | "status" | "reply", value?: string) => {
    await runAction(async () => {
      if (action === "delete") await apiClient.deleteSubmission(adminToken(), source, id);
      if (action === "status") await apiClient.updateSubmissionStatus(adminToken(), source, id, value || "pending");
      if (action === "reply") {
        await apiClient.replyToSubmission(adminToken(), source, id, { subject: replyDraft.subject, message: replyDraft.message });
        setReplyDraft({ source: "", id: "", subject: "Reply from HOI Business Center", message: "" });
      }
    }, "Requirement updated");
  };
  const uploadResourceImage = async (file: File) => {
    const response = await apiClient.uploadAdminImage(adminToken(), file);
    return response.data.url as string;
  };
  const userAction = async (id: string | number, action: "suspend" | "activate" | "delete") => {
    await runAction(async () => {
      if (action === "delete") await apiClient.deleteWebsiteUser(adminToken(), id);
      if (action === "suspend") await apiClient.updateWebsiteUserStatus(adminToken(), id, "suspended");
      if (action === "activate") await apiClient.updateWebsiteUserStatus(adminToken(), id, "active");
    }, action === "delete" ? "User deleted" : "User status updated");
  };
  const logout = () => {
    sessionStorage.removeItem("hoi_admin_token");
    setLocation("/admin-login");
  };
  const retryLoad = () => {
    setLoading(true);
    setError("");
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load admin dashboard"))
      .finally(() => setLoading(false));
  };
  if (loading) return <LoadingState title="Loading admin dashboard" message="Fetching users, submissions, content, and website data." />;
  if ((error || loadError) && !data) {
    return <ErrorState title="Admin panel could not load" message={loadError || error} primaryLabel="Retry" onPrimary={retryLoad} secondaryHref="/admin-login" />;
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader data={data} onLogout={logout} />
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar active={active} setActive={setActive} />
        <main className="min-w-0">
          {error ? <InlineFeedback message={error} type="error" onClose={() => setError("")} /> : null}
          {notice ? <InlineFeedback message={notice} type="success" onClose={() => setNotice("")} /> : null}
          {active === "overview" && <Overview data={data} onNavigate={setActive} />}
          {active === "pages" && <PageContentPanel activePage={activePage} setActivePage={setActivePage} contentMap={contentMap} onSaveField={savePageField} />}
          {["services", "packages", "venues", "events"].includes(active) && (
            <ResourceManager
              resource={currentResource}
              rows={resourceRows}
              query={query}
              setQuery={setQuery}
              draft={currentDraft}
              setDraft={(draft) => setResourceDrafts((prev) => ({ ...prev, [currentResource]: draft }))}
              selected={selected}
              setSelected={setSelected}
              onSubmit={saveResource}
              onDelete={(row) => runAction(() => apiClient.deleteAdminResource(adminToken(), currentResource, row.id), "Record deleted")}
              onImageUpload={uploadResourceImage}
              saving={saving}
            />
          )}
          {active === "manpower" && (
            <ManpowerPanel rows={safeJson(contentMap["manpower.roles"]?.value, [])} onSave={(roles) => runAction(() => apiClient.saveCmsContent(adminToken(), { contentKey: "manpower.roles", label: "Manpower roles", value: JSON.stringify(roles, null, 2), type: "json" }), "Manpower form saved")} />
          )}
          {active === "theme" && (
            <ThemePanel contentMap={contentMap} onSave={saveTheme} saving={saving} />
          )}
          {active === "requirements" && (
            <RequirementsPanel data={data} replyDraft={replyDraft} setReplyDraft={setReplyDraft} onAction={submissionAction} />
          )}
          {active === "notifications" && <NotificationsPanel data={data} onAction={submissionAction} onClear={(ids) => runAction(() => apiClient.clearAdminNotifications(adminToken(), ids ?? (data?.notifications ?? []).map((item) => item.id)), ids ? "Notification removed" : "Notifications cleared")} />}
          {active === "admins" && (
            <AdminUsersPanel
              data={data}
              adminDraft={adminDraft}
              setAdminDraft={setAdminDraft}
              onSaveAdmin={saveAdminUser}
              onDeleteAdmin={(row) => runAction(() => apiClient.deleteAdminUser(adminToken(), row.id), "Admin access removed")}
              saving={saving}
            />
          )}
          {active === "users" && <UsersPanel rows={data?.users ?? []} onAction={userAction} />}
          {active === "settings" && (
            <SettingsPanel
              data={data}
              passwordDraft={passwordDraft} setPasswordDraft={setPasswordDraft} onChangePassword={changePassword} saving={saving}
            />
          )}
        </main>
      </div>
    </div>
  );
}
