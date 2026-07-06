import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type CmsMap = Record<string, string>;

export function useCmsContent(fallback: CmsMap) {
  const [content, setContent] = useState<CmsMap>(fallback);

  useEffect(() => {
    let mounted = true;
    apiClient
      .getCmsContent()
      .then((response) => {
        if (mounted) {
          setContent({ ...fallback, ...response.data.map });
        }
      })
      .catch(() => {
        if (mounted) {
          setContent(fallback);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (key: string) => content[key] ?? fallback[key] ?? "";
}
