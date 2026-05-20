type Client = { request: <T = any>(endpoint: string, options?: any) => Promise<T> };

export const adminApiMethods = {
  getAdminDashboard(this: Client, token: string) {
    return this.request("/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } });
  },
  getCmsContent(this: Client) {
    return this.request("/cms/content");
  },
  saveCmsContent(this: Client, token: string, content: unknown) {
    return this.request("/cms/content", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(content) });
  },
  deleteCmsContent(this: Client, token: string, contentKey: string) {
    return this.request(`/cms/content/${encodeURIComponent(contentKey)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  },
  saveAdminResource(this: Client, token: string, resource: string, payload: Record<string, unknown>, id?: number | string) {
    return this.request(`/admin/resource/${resource}${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  },
  uploadAdminImage(this: Client, token: string, file: File) {
    const formData = new FormData();
    formData.append("image", file);
    return this.request("/admin/upload/image", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
  },
  deleteAdminResource(this: Client, token: string, resource: string, id: number | string) {
    return this.request(`/admin/resource/${resource}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  },
  updateSubmissionStatus(this: Client, token: string, source: string, id: number | string, status: string) {
    return this.request(`/admin/submission/${source}/${id}/status`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
  },
  deleteSubmission(this: Client, token: string, source: string, id: number | string) {
    return this.request(`/admin/submission/${source}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  },
  replyToSubmission(this: Client, token: string, source: string, id: number | string, payload: { subject: string; message: string }) {
    return this.request(`/admin/submission/${source}/${id}/reply`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  },
  clearAdminNotifications(this: Client, token: string, ids: string[]) {
    return this.request("/admin/notifications", { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ ids }) });
  },
  updateAdminProfile(this: Client, token: string, payload: Record<string, unknown>) {
    return this.request("/admin/profile", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  },
  changeAdminPassword(this: Client, token: string, payload: Record<string, unknown>) {
    return this.request("/admin/password", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  },
  saveAdminUser(this: Client, token: string, payload: Record<string, unknown>, id?: number | string) {
    return this.request(`/admin/users${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  },
  deleteAdminUser(this: Client, token: string, id: number | string) {
    return this.request(`/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  },
  updateWebsiteUserStatus(this: Client, token: string, id: number | string, status: string) {
    return this.request(`/admin/website-users/${id}/status`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
  },
  deleteWebsiteUser(this: Client, token: string, id: number | string) {
    return this.request(`/admin/website-users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  },
};
