"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingKYC: 0,
    pendingWithdrawals: 0,
    supportTickets: 0,
    mediaFiles: 0,
    gpuPlans: 0,
    rlhfQuestions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get total users
      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Get total transactions
      const { count: transactionCount } = await supabase
        .from("payment_transactions")
        .select("*", { count: "exact", head: true });

      // Get total revenue
      const { data: payments } = await supabase
        .from("payment_transactions")
        .select("amount");

      // Get pending KYC
      const { count: pendingKYCCount } = await supabase
        .from("kyc_documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get pending withdrawals
      const { count: pendingWithdrawalsCount } = await supabase
        .from("withdrawal_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get support tickets
      const { count: ticketCount } = await supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true });

      // Get media files
      const { count: mediaCount } = await supabase
        .from("datacenter_media")
        .select("*", { count: "exact", head: true });

      // Get GPU plans
      const { count: gpuCount } = await supabase
        .from("gpu_node_plans")
        .select("*", { count: "exact", head: true });

      // Get RLHF questions
      const { count: rlhfCount } = await supabase
        .from("rlhf_questions")
        .select("*", { count: "exact", head: true });

      const totalRevenue =
        payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) ||
        0;

      setStats({
        totalUsers: userCount || 0,
        totalTransactions: transactionCount || 0,
        totalRevenue: totalRevenue,
        pendingKYC: pendingKYCCount || 0,
        pendingWithdrawals: pendingWithdrawalsCount || 0,
        supportTickets: ticketCount || 0,
        mediaFiles: mediaCount || 0,
        gpuPlans: gpuCount || 0,
        rlhfQuestions: rlhfCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Complete platform management and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/users">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered users
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/payments">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total payments
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/payments">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${stats.totalRevenue.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Platform earnings
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/gpu-node-plans">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                GPU Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.gpuPlans}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active node plans
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/rlhf-questions">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                RLHF Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.rlhfQuestions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active questions
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/kyc">
          <Card className="border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Pending KYC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.pendingKYC}
              </div>
              <p className="text-xs text-orange-700 mt-1">Awaiting review</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/withdrawals">
          <Card className="border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Pending Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.pendingWithdrawals}
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Awaiting processing
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/support-tickets">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.supportTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">Open tickets</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
