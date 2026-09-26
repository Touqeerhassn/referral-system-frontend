"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  RotateCcw,
  MessageCircle,
  Phone,
  Ticket,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  Trophy,
  Filter,
  X,
  Megaphone,
} from "lucide-react";
import {
  useBusinessParticipants,
  type BusinessParticipantItem,
  type ApiCampaignItem,
} from "@/lib/api/business";
import { useConfirmParticipantOrder } from "@/lib/api/participant";
import { ROUTES } from "@/lib/constants";

interface ParticipantOrdersTableProps {
  businessId: string;
  campaigns?: ApiCampaignItem[];
  selectedCampaignId?: string | null;
  onSelectCampaign?: (campaignId: string | null) => void;
}

export function ParticipantOrdersTable({
  businessId,
  campaigns = [],
  selectedCampaignId = null,
  onSelectCampaign,
}: ParticipantOrdersTableProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed">("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync external selectedCampaignId if prop changes
  useEffect(() => {
    if (selectedCampaignId) {
      setCampaignFilter(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const handleCampaignChange = (cid: string) => {
    setCampaignFilter(cid);
    if (onSelectCampaign) {
      onSelectCampaign(cid === "all" ? null : cid);
    }
  };

  // Quick manual ID confirm bar
  const [manualId, setManualId] = useState("");

  // Fetch all business participants from API: GET /api/businesses/:businessId/participants
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBusinessParticipants(businessId);

  // Mutation to confirm participant order: PATCH /api/participants/:id/confirm
  const confirmMutation = useConfirmParticipantOrder();

  const participants: BusinessParticipantItem[] = data?.participants || [];

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Participant ID copied: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmOrder = (participantId: string, participantName: string) => {
    confirmMutation.mutate(participantId, {
      onSuccess: (res) => {
        toast.success(
          res.message || `Order confirmed for ${participantName}! Referral rewards distributed.`
        );
        // Refresh participants and campaigns metrics
        queryClient.invalidateQueries({ queryKey: ["business-participants", businessId] });
        queryClient.invalidateQueries({ queryKey: ["business-campaigns", businessId] });
      },
      onError: (err: any) => {
        const errorMsg =
          err?.response?.data?.error || err?.message || "Failed to confirm order.";
        toast.error(errorMsg);
      },
    });
  };

  const handleManualConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualId.trim();
    if (!cleanId) {
      toast.error("Please enter a participant ID (e.g. part_...)");
      return;
    }
    handleConfirmOrder(cleanId, cleanId);
    setManualId("");
  };

  // Filter by Campaign, Status, and Search
  const filteredParticipants = participants.filter((p) => {
    // Campaign filter
    if (campaignFilter !== "all" && p.campaignId !== campaignFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && p.orderStatus !== statusFilter) {
      return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.referralCode.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.campaignName && p.campaignName.toLowerCase().includes(q))
    );
  });

  const activeCampaignObj = campaigns.find((c) => c.id === campaignFilter);

  const pendingCount = participants.filter(
    (p) =>
      p.orderStatus === "pending" &&
      (campaignFilter === "all" || p.campaignId === campaignFilter)
  ).length;

  const confirmedCount = participants.filter(
    (p) =>
      p.orderStatus === "confirmed" &&
      (campaignFilter === "all" || p.campaignId === campaignFilter)
  ).length;

  return (
    <div
      id="participant-orders-section"
      className="card p-5 sm:p-6 mb-8 border border-[var(--color-border)] shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              Participant Orders & Confirmations
            </h2>
            {pendingCount > 0 && (
              <span className="badge badge-warning text-[0.68rem] font-bold animate-pulse">
                {pendingCount} Pending Verification
              </span>
            )}
            {activeCampaignObj && (
              <span className="badge badge-primary text-[0.68rem] font-bold">
                Filtered: {activeCampaignObj.name || activeCampaignObj.title}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            When a participant completes payment via external DM, cash, or bank transfer, click{" "}
            <strong>Confirm Order</strong> to verify their request and distribute referral discounts to their network.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            title="Refresh participants"
          >
            <RotateCcw
              size={13}
              className={isFetching ? "animate-spin text-[var(--color-primary)]" : ""}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Campaign Specific Filter Tabs */}
      {campaigns.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1">
              <Filter size={12} className="text-[var(--color-primary)]" />
              <span>Filter Against Specific Campaign:</span>
            </span>
            {campaignFilter !== "all" && (
              <button
                type="button"
                onClick={() => handleCampaignChange("all")}
                className="text-[0.72rem] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <X size={12} />
                <span>Show All Campaigns</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleCampaignChange("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                campaignFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All Campaigns ({participants.length})
            </button>

            {campaigns.map((c) => {
              const campParts = participants.filter((p) => p.campaignId === c.id);
              const campPending = campParts.filter((p) => p.orderStatus === "pending").length;
              const isSelected = campaignFilter === c.id;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCampaignChange(c.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <Megaphone size={12} />
                  <span>{c.name || c.title}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {campParts.length}
                  </span>
                  {campPending > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Campaign Detail Callout */}
          {activeCampaignObj && (
            <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-indigo-950 block text-sm">
                  {activeCampaignObj.name || activeCampaignObj.title}
                </span>
                <span className="text-[0.72rem] text-indigo-800">
                  Tiers: Tier 1: <strong>{activeCampaignObj.tier1Pct}%</strong> | Tier 2:{" "}
                  <strong>{activeCampaignObj.tier2Pct}%</strong> | Tier 3:{" "}
                  <strong>{activeCampaignObj.tier3Pct}%</strong> (Max Cap:{" "}
                  {activeCampaignObj.maxDiscountCapPct}%)
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeCampaignObj.slug && (
                  <Link
                    href={`/c/${activeCampaignObj.slug}`}
                    target="_blank"
                    className="btn btn-secondary text-xs px-2.5 py-1.5 font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <span>Public Page</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
                <Link
                  href={ROUTES.campaignLeaderboard(activeCampaignObj.id)}
                  className="btn btn-primary text-xs px-2.5 py-1.5 font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Trophy size={12} />
                  <span>Leaderboard</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual ID Confirmation Bar */}
      <form
        onSubmit={handleManualConfirmSubmit}
        className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
      >
        <span className="font-semibold text-slate-700 whitespace-nowrap">
          Quick Confirm by ID:
        </span>
        <input
          type="text"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="Paste participant ID (e.g. part_...)"
          className="input-base text-xs py-1.5 px-3 flex-1 font-mono"
        />
        <button
          type="submit"
          disabled={confirmMutation.isPending || !manualId.trim()}
          className="btn btn-primary px-4 py-1.5 text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
        >
          {confirmMutation.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <ShieldCheck size={14} />
          )}
          <span>Confirm ID</span>
        </button>
      </form>

      {/* Status Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-[var(--color-text-primary)] shadow-2xs font-bold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            All ({participants.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === "pending"
                ? "bg-white text-amber-700 shadow-2xs font-bold"
                : "text-[var(--color-text-muted)] hover:text-amber-700"
            }`}
          >
            <Clock size={12} className="text-amber-600" />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("confirmed")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === "confirmed"
                ? "bg-white text-emerald-700 shadow-2xs font-bold"
                : "text-[var(--color-text-muted)] hover:text-emerald-700"
            }`}
          >
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Confirmed ({confirmedCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, code..."
            className="input-base text-xs pl-8 pr-3 py-1.5 w-full"
          />
        </div>
      </div>

      {/* Participants Table / List */}
      {isLoading ? (
        <div className="py-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-[var(--color-primary)] animate-spin mb-2" />
          <p className="text-xs text-[var(--color-text-muted)]">
            Loading participants across your campaigns...
          </p>
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-xl my-2">
          <Users size={32} className="mx-auto text-[var(--color-text-muted)] mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
            {participants.length === 0
              ? "No participants have joined yet"
              : "No matching participants found"}
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            {participants.length === 0
              ? "Share your public campaign link with customers. When they sign up, their requests will appear here for verification!"
              : "Try adjusting your search query, status filter, or campaign selection."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold text-[0.68rem] bg-slate-50/60">
                <th className="py-2.5 px-3">Participant</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Campaign</th>
                <th className="py-2.5 px-3">Referral Code</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filteredParticipants.map((p) => {
                const isPending = p.orderStatus === "pending";
                const isThisConfirming =
                  confirmMutation.isPending &&
                  confirmMutation.variables === p.id;
                const isCopied = copiedId === p.id;

                const cleanPhone = p.phone.replace(/\D/g, "");
                const whatsappUrl = `https://wa.me/${cleanPhone}`;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Participant Name & ID */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[var(--color-text-primary)] text-sm">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <code className="text-[0.68rem] font-mono text-[var(--color-text-muted)] bg-slate-100 px-1.5 py-0.5 rounded">
                          {p.id}
                        </code>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(p.id, e)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                          title="Copy Participant ID"
                        >
                          {isCopied ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Phone & Contact */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-[var(--color-text-secondary)] block">
                        {p.phone}
                      </span>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[0.68rem] text-emerald-600 hover:text-emerald-700 font-semibold mt-0.5"
                      >
                        <MessageCircle size={11} />
                        <span>Chat WhatsApp</span>
                      </a>
                    </td>

                    {/* Campaign */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleCampaignChange(p.campaignId)}
                        className="badge badge-secondary text-[0.7rem] font-semibold truncate max-w-[140px] block hover:bg-slate-200 cursor-pointer text-left"
                        title="Filter by this campaign"
                      >
                        {p.campaignName || p.campaignId}
                      </button>
                    </td>

                    {/* Referral Code */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block">
                        {p.referralCode}
                      </div>
                      {p.referredById && (
                        <span className="block text-[0.65rem] text-[var(--color-text-muted)] mt-0.5">
                          Invited by network
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-[var(--color-text-muted)] whitespace-nowrap text-[0.72rem]">
                      {new Date(p.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Order Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[0.7rem] font-bold">
                          <Clock size={11} className="text-amber-600" />
                          <span>Pending DM / Pay</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[0.7rem] font-bold">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>Confirmed</span>
                        </span>
                      )}
                    </td>

                    {/* Confirm Action Button */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isPending ? (
                        <button
                          type="button"
                          id={`btn-confirm-${p.id}`}
                          onClick={() => handleConfirmOrder(p.id, p.name)}
                          disabled={confirmMutation.isPending}
                          className="btn btn-primary px-3 py-1.5 text-xs font-bold shadow-xs hover:shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {isThisConfirming ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Confirming...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={13} />
                              <span>Confirm Order</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[0.72rem] text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <Check size={13} className="text-emerald-600" />
                          <span>Rewards Sent</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
