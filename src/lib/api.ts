import { API_BASE_URL } from "./config";

export async function fetchApi(path: string, options?: RequestInit) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      typeof errorData.error === "string"
        ? errorData.error
        : typeof errorData.error?.message === "string"
        ? errorData.error.message
        : typeof errorData.message === "string"
        ? errorData.message
        : `API Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return response;
}

