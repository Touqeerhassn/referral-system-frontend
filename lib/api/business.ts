import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "./axios";

export interface RegisterBusinessPayload {
  name: string;
  email: string;
  phone: string;
}

export interface BusinessData {
  id: string;
  name: string;
  subsStatus?: string;
  createdAt?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface RegisterBusinessResponse {
  success?: boolean;
  message?: string;
  token?: string;
  id?: string;
  name?: string;
  subsStatus?: string;
  createdAt?: string;
  business?: BusinessData;
  [key: string]: unknown;
}


/**
 * API call: POST BASE_URL/api/businesses/register { name, email, phone }
 */
export async function registerBusiness(
  payload: RegisterBusinessPayload
): Promise<RegisterBusinessResponse> {
  const response = await apiClient.post<RegisterBusinessResponse>(
    "/api/businesses/register",
    {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
    }
  );
  return response.data;
}

/**
 * TanStack React Query Mutation hook for business registration
 */
export function useRegisterBusiness(): UseMutationResult<
  RegisterBusinessResponse,
  Error,
  RegisterBusinessPayload
> {
  return useMutation({
    mutationFn: registerBusiness,
  });
}

/** Retrieve current business ID from localStorage */
export function getStoredBusinessId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("business_id");
}

/** Retrieve parsed business data object from localStorage */
export function getStoredBusiness(): BusinessData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("business");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BusinessData;
  } catch {
    return null;
  }
}

