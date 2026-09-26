import {
  useMutation,
  useQuery,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "./axios";

export interface CreateCampaignPayload {
  businessId: string;
  name: string;
  slug: string;
  startDateTime: string;
  endDateTime?: string | null;
  tier1Pct: number;
  tier2Pct: number;
  tier3Pct: number;
  maxDiscountCapPct: number;
}

export interface CampaignDetails {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  startDateTime: string;
  endDateTime?: string | null;
  tier1Pct: number;
  tier2Pct: number;
  tier3Pct: number;
  maxDiscountCapPct: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface CreateCampaignResponse {
  success?: boolean;
  message?: string;
  publicLink?: string;
  campaign?: CampaignDetails;
  error?: string;
  [key: string]: unknown;
}

export interface CampaignBySlugResponse {
  success: boolean;
  campaign?: CampaignDetails;
  error?: string;
  [key: string]: unknown;
}

/**
 * API call: POST BASE_URL/api/campaigns
 * Payload: { businessId, name, slug, startDateTime, endDateTime, tier1Pct, tier2Pct, tier3Pct, maxDiscountCapPct }
 */
export async function createCampaign(
  payload: CreateCampaignPayload
): Promise<CreateCampaignResponse> {
  const response = await apiClient.post<CreateCampaignResponse>(
    "/api/campaigns",
    payload
  );
  return response.data;
}

/**
 * TanStack React Query Mutation hook for creating a campaign
 */
export function useCreateCampaign(): UseMutationResult<
  CreateCampaignResponse,
  Error,
  CreateCampaignPayload
> {
  return useMutation({
    mutationFn: createCampaign,
  });
}

/**
 * API call: GET BASE_URL/api/campaigns/by-slug/:slug
 */
export async function getCampaignBySlug(
  slug: string
): Promise<CampaignBySlugResponse> {
  const response = await apiClient.get<CampaignBySlugResponse>(
    `/api/campaigns/by-slug/${slug}`
  );
  return response.data;
}

/**
 * TanStack React Query Hook for fetching campaign by slug
 */
export function useCampaignBySlug(
  slug: string
): UseQueryResult<CampaignBySlugResponse, Error> {
  return useQuery({
    queryKey: ["campaign", "slug", slug],
    queryFn: () => getCampaignBySlug(slug),
    enabled: !!slug,
    retry: 1,
  });
}
export interface CampaignByIdResponse {
  success: boolean;
  campaign?: CampaignDetails;
  error?: string;
  [key: string]: unknown;
}

/**
 * API call: GET BASE_URL/api/campaigns/:campaignId
 */
export async function getCampaignById(
  campaignId: string
): Promise<CampaignByIdResponse> {
  const response = await apiClient.get<CampaignByIdResponse>(
    `/api/campaigns/${campaignId}`
  );
  return response.data;
}

/**
 * TanStack React Query Hook for fetching single campaign by ID
 */
export function useCampaignById(
  campaignId: string | null | undefined
): UseQueryResult<CampaignByIdResponse, Error> {
  return useQuery({
    queryKey: ["campaign", "id", campaignId],
    queryFn: () => getCampaignById(campaignId!),
    enabled: Boolean(campaignId),
    retry: 1,
  });
}

export interface LeaderboardEntry {
  participantId: string;
  participantName: string;
  phone: string;
  totalDiscountEarnedPct: number;
  referralCount: number | string;
  rank?: number;
  name?: string;
  referralCode?: string;
  totalDirectReferrals?: number;
  totalEarnedPct?: number;
  [key: string]: unknown;
}

export interface CampaignLeaderboardResponse {
  success: boolean;
  campaignId: string;
  leaderboard: LeaderboardEntry[];
  error?: string;
  [key: string]: unknown;
}

/**
 * API call: GET BASE_URL/api/campaigns/:campaignId/leaderboard
 */
export async function getCampaignLeaderboard(
  campaignId: string
): Promise<CampaignLeaderboardResponse> {
  const response = await apiClient.get<CampaignLeaderboardResponse>(
    `/api/campaigns/${campaignId}/leaderboard`
  );
  return response.data;
}

/**
 * TanStack React Query Hook for fetching campaign leaderboard
 */
export function useCampaignLeaderboard(
  campaignId: string | null | undefined
): UseQueryResult<CampaignLeaderboardResponse, Error> {
  return useQuery({
    queryKey: ["campaign", "leaderboard", campaignId],
    queryFn: () => getCampaignLeaderboard(campaignId!),
    enabled: Boolean(campaignId),
    refetchInterval: 15000,
  });
}
