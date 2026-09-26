import {
  useMutation,
  useQuery,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "./axios";

export interface JoinCampaignPayload {
  campaignId: string;
  name: string;
  phone: string;
  incomingRefCode?: string;
}

export interface ParticipantData {
  id: string;
  campaignId: string;
  name: string;
  phone: string;
  referralCode: string;
  referredById?: string | null;
  orderStatus: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface JoinCampaignResponse {
  success: boolean;
  message?: string;
  participant?: ParticipantData;
  participantId?: string;
  shareableLink?: string;
  error?: string;
  field?: string;
  [key: string]: unknown;
}

export interface ParticipantMetrics {
  totalEarnedPct: number;
  applicableDiscountPct: number;
  maxDiscountCapPct: number;
  directReferrals: number;
  indirectReferrals: number;
}

export interface LedgerDetail {
  id: string;
  campaignId: string;
  beneficiaryId: string;
  triggerParticipantId: string;
  tierLevel: number;
  discountPercent: number;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface ParticipantSummaryResponse {
  success: boolean;
  participant: ParticipantData;
  metrics: ParticipantMetrics;
  ledgerDetails: LedgerDetail[];
  error?: string;
  [key: string]: unknown;
}

/**
 * API call: POST BASE_URL/api/participants/join
 * Payload: { campaignId, name, phone, incomingRefCode? }
 */
export async function joinCampaign(
  payload: JoinCampaignPayload
): Promise<JoinCampaignResponse> {
  const response = await apiClient.post<JoinCampaignResponse>(
    "/api/participants/join",
    payload
  );
  return response.data;
}

/**
 * TanStack React Query Mutation hook for joining a campaign
 */
export function useJoinCampaign(): UseMutationResult<
  JoinCampaignResponse,
  Error,
  JoinCampaignPayload
> {
  return useMutation({
    mutationFn: joinCampaign,
  });
}

/**
 * API call: GET BASE_URL/api/participants/:id/summary
 */
export async function getParticipantSummary(
  participantId: string
): Promise<ParticipantSummaryResponse> {
  const response = await apiClient.get<ParticipantSummaryResponse>(
    `/api/participants/${participantId}/summary`
  );
  return response.data;
}

/**
 * TanStack React Query Query hook for getting participant summary / discount metrics
 */
export function useParticipantSummary(
  participantId: string | null | undefined
): UseQueryResult<ParticipantSummaryResponse, Error> {
  return useQuery({
    queryKey: ["participantSummary", participantId],
    queryFn: () => getParticipantSummary(participantId!),
    enabled: !!participantId,
    refetchInterval: 15000, // optionally auto-refresh every 15s to see new confirmed referral discounts!
  });
}

export interface ConfirmOrderResponse {
  success: boolean;
  message?: string;
  participant?: ParticipantData;
  rewards?: unknown[];
  error?: string;
  [key: string]: unknown;
}

/**
 * API call: PATCH BASE_URL/api/participants/:id/confirm
 * Called by business owner to confirm participant order and distribute multi-tier referral rewards
 */
export async function confirmParticipantOrder(
  participantId: string
): Promise<ConfirmOrderResponse> {
  const response = await apiClient.patch<ConfirmOrderResponse>(
    `/api/participants/${participantId}/confirm`
  );
  return response.data;
}

/**
 * TanStack React Query Mutation hook for confirming a participant's order
 */
export function useConfirmParticipantOrder(): UseMutationResult<
  ConfirmOrderResponse,
  Error,
  string
> {
  return useMutation({
    mutationFn: confirmParticipantOrder,
  });
}

export interface LookupParticipantPayload {
  campaignId?: string;
  phone?: string;
  referralCode?: string;
  participantId?: string;
}

export interface LookupParticipantResponse {
  success: boolean;
  participant?: ParticipantData;
  shareableLink?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * API call: POST BASE_URL/api/participants/lookup
 * Allows returning participants to find their profile and check status by phone or referral code
 */
export async function lookupParticipant(
  payload: LookupParticipantPayload
): Promise<LookupParticipantResponse> {
  const response = await apiClient.post<LookupParticipantResponse>(
    "/api/participants/lookup",
    payload
  );
  return response.data;
}

/**
 * TanStack React Query Mutation hook for looking up a participant
 */
export function useLookupParticipant(): UseMutationResult<
  LookupParticipantResponse,
  Error,
  LookupParticipantPayload
> {
  return useMutation({
    mutationFn: lookupParticipant,
  });
}


