const SERVICE_FALLBACK_IMAGES: Record<string, string> = {
  "booth-reservation": "/assets/hoi-event-reg.jpg",
  "booth-design": "/assets/hoi-booth-setup.jpg",
  "booth-install-demolition": "/assets/hoi-booth-install.jpg",
  logistics: "/assets/hoi-booth-construction.jpg",
  marketing: "/assets/hoi-team-candid.jpg",
  "interpretation-protocol": "/assets/hoi-team-group.webp",
};

const SERVICE_FALLBACK_VIDEOS: Record<string, string> = {
  "booth-install-demolition": "/assets/hoi-booth-video.mov",
};

export function getServiceMediaImage(serviceId: string, images?: string[]) {
  const fallback = SERVICE_FALLBACK_IMAGES[serviceId];
  const direct = images?.find((image) => typeof image === "string" && image.trim().length > 0);
  return fallback || direct || "/assets/yashobhoomi.png";
}

export function getServiceMediaVideo(serviceId: string) {
  return SERVICE_FALLBACK_VIDEOS[serviceId];
}
