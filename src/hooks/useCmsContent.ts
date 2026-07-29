import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { translateCmsValue } from "@/lib/site-translations";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";

type CmsMap = Record<string, string>;

export function useCmsContent(fallback: CmsMap) {
  const { language } = useSiteLanguage();
  const [remoteContent, setRemoteContent] = useState<CmsMap | null>(null);

  useEffect(() => {
    let mounted = true;
    apiClient
      .getCmsContent()
      .then((response) => {
        if (mounted) {
          setRemoteContent(response.data.map ?? {});
        }
      })
      .catch(() => {
        if (mounted) {
          setRemoteContent({});
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const base = remoteContent ? { ...fallback, ...remoteContent } : fallback;
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [key, translateCmsValue(language, key, value)]),
    ) as CmsMap;
  }, [fallback, language, remoteContent]);

  return (key: string) => content[key] ?? fallback[key] ?? "";
}
