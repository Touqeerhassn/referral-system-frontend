import {
  useMutation,
  useQuery,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "./axios";

export interface RegisterBusinessPayload {
  name: string;
  phone: string;
  email?: string; // Optional
  role?: string;
}

// ── WhatsApp Reverse Verification ─────────────────────────────────────────────

export interface InitiateVerifyPayload {
  name: string;
  phone: string;
  email?: string;
  role?: string;
}

export interface InitiateVerifyResponse {
  nonce: string;
  waLink: string; // e.g. https://wa.me/1234?text=VERIFY_REF-938214
  expiresAt?: number;
  message?: string;
}

export interface VerifyStatusResponse {
  status: "PENDING" | "VERIFIED" | "EXPIRED";
  token?: string;
  business?: BusinessData;
  message?: string;
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

export interface ApiCampaignItem {
  id: string;
  businessId?: string;
  name?: string;
  slug?: string;
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string | null;
  tier1Pct?: number;
  tier2Pct?: number;
  tier3Pct?: number;
  maxDiscountCapPct?: number;
  reward?: string;
  rewardType?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  totalReferrals?: number;
  totalParticipants?: number;
  referralLinkBase?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface BusinessCampaignsResponse {
  success: boolean;
  business: {
    id: string;
    name: string;
    subsStatus: string;
    createdAt: string;
    [key: string]: unknown;
  };
  campaigns: ApiCampaignItem[];
  error?: string;
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

// ── WhatsApp Reverse Verification Helpers ─────────────────────────────────────

/**
 * Step 1: Initiate WhatsApp verification — backend generates a nonce
 * and returns a pre-filled wa.me deep-link for the user to open.
 * POST /api/businesses/verify/initiate
 */
export async function initiateWhatsAppVerify(
  payload: InitiateVerifyPayload
): Promise<InitiateVerifyResponse> {
  const response = await apiClient.post<InitiateVerifyResponse>(
    "/api/businesses/verify/initiate",
    payload
  );
  return response.data;
}

export function useInitiateWhatsAppVerify(): UseMutationResult<
  InitiateVerifyResponse,
  Error,
  InitiateVerifyPayload
> {
  return useMutation({ mutationFn: initiateWhatsAppVerify });
}

/**
 * Step 2: Poll verification status — frontend calls this every 2s until
 * backend confirms the WhatsApp message was received.
 * GET /api/businesses/verify/status?nonce=REF-938214
 */
export async function checkVerifyStatus(
  nonce: string
): Promise<VerifyStatusResponse> {
  const response = await apiClient.get<VerifyStatusResponse>(
    `/api/businesses/verify/status?nonce=${nonce}`
  );
  return response.data;
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

/**
 * API call: GET BASE_URL/api/businesses/:businessId/campaigns
 */
export async function getBusinessCampaigns(
  businessId: string
): Promise<BusinessCampaignsResponse> {
  const response = await apiClient.get<BusinessCampaignsResponse>(
    `/api/businesses/${businessId}/campaigns`
  );
  return response.data;
}

/**
 * TanStack React Query hook to fetch business campaigns
 */
export function useBusinessCampaigns(
  businessId: string | null | undefined
): UseQueryResult<BusinessCampaignsResponse, Error> {
  return useQuery({
    queryKey: ["business-campaigns", businessId],
    queryFn: () => getBusinessCampaigns(businessId!),
    enabled: Boolean(businessId),
    staleTime: 30 * 1000,
  });
}

export interface BusinessParticipantItem {
  id: string;
  campaignId: string;
  campaignName?: string;
  campaignSlug?: string;
  name: string;
  phone: string;
  referralCode: string;
  referredById?: string | null;
  orderStatus: "pending" | "confirmed" | string;
  createdAt: string;
  [key: string]: unknown;
}

export interface BusinessParticipantsResponse {
  success: boolean;
  participants: BusinessParticipantItem[];
  error?: string;
  [key: string]: unknown;
}

/**
 * API call: GET BASE_URL/api/businesses/:businessId/participants
 */
export async function getBusinessParticipants(
  businessId: string
): Promise<BusinessParticipantsResponse> {
  const response = await apiClient.get<BusinessParticipantsResponse>(
    `/api/businesses/${businessId}/participants`
  );
  return response.data;
}

/**
 * TanStack React Query hook to fetch all participants across campaigns for a business
 */
export function useBusinessParticipants(
  businessId: string | null | undefined
): UseQueryResult<BusinessParticipantsResponse, Error> {
  return useQuery({
    queryKey: ["business-participants", businessId],
    queryFn: () => getBusinessParticipants(businessId!),
    enabled: Boolean(businessId),
    refetchInterval: 15000, // auto-refresh to catch new pending DM / participation requests!
  });
}

// ── Quick Phone Login ──────────────────────────────────────────────────────────

export interface LoginPayload {
  phone: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  business?: BusinessData;
  error?: string;
}

export async function loginBusiness(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/businesses/login", payload);
  return response.data;
}

export function useLoginBusiness(): UseMutationResult<
  LoginResponse,
  Error,
  LoginPayload
> {
  return useMutation({ mutationFn: loginBusiness });
}




