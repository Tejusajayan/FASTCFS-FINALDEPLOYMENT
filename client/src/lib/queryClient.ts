import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
      // Try to parse as JSON for error message
      try {
        const json = JSON.parse(text);
        if (json && json.message) throw new Error(`${res.status}: ${json.message}`);
      } catch { /* not JSON, ignore */ }
    } catch {}
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
}

export async function apiRequest(method: string, url: string, data?: any) {
  const fetchOptions: RequestInit = {
    method,
    credentials: "include",
    headers: {},
  };
  if (data !== undefined && method !== "GET" && method !== "HEAD") {
    fetchOptions.headers = { "Content-Type": "application/json" };
    fetchOptions.body = JSON.stringify(data);
  }
  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    let message = "";
    try {
      const err = await res.json();
      message = err.message || JSON.stringify(err);
    } catch {
      message = await res.text();
    }
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});