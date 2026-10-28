"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// Palette matching Sheggar Wheels design system
const PALETTE = [
  "#059669", // emerald-600
  "#7c3aed", // purple-600
  "#0284c7", // sky-600
  "#d97706", // amber-600
  "#e11d48", // rose-600
  "#4f46e5", // indigo-600
  "#0d9488", // teal-600
  "#64748b", // slate-500
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
}

// -------------------------------------------------------------
// Custom Tooltip for Monetary & Count Metrics
// -------------------------------------------------------------
function CustomChartTooltip({
  active,
  payload,
  label,
  valuePrefix = "",
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs backdrop-blur-sm">
      {label && <p className="font-bold text-slate-300 mb-1.5 pb-1 border-b border-slate-800">{label}</p>}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: item.color || "#10b981" }}
              />
              <span className="text-slate-400 capitalize">{item.name}:</span>
            </div>
            <span className="font-mono font-bold text-white">
              {valuePrefix}
              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. Admin Revenue & Commission Area Chart
// -------------------------------------------------------------
export function AdminRevenueAreaChart({
  data,
}: {
  data: { month: string; revenue: number; commission: number; bookings: number }[];
}) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="adminCommGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            content={
              <CustomChartTooltip
                valueSuffix=" ETB"
              />
            }
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Gross Volume"
            stroke="#7c3aed"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#adminRevenueGrad)"
          />
          <Area
            type="monotone"
            dataKey="commission"
            name="10% Commission"
            stroke="#059669"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#adminCommGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Admin User Distribution Pie Chart (Renters, Hosts, Admins, Suspended)
// -------------------------------------------------------------
export function AdminUserPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              content={
                <CustomChartTooltip
                  valueSuffix=" users"
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Count Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{total}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Admin Fleet Distribution by Location Pie Chart
// -------------------------------------------------------------
export function AdminFleetPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[(index + 2) % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              content={
                <CustomChartTooltip
                  valueSuffix=" cars"
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{total}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Listings</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. Admin Booking Volume & Status Bar Chart
// -------------------------------------------------------------
export function AdminMonthlyBarChart({
  data,
}: {
  data: { month: string; bookings: number; completed: number }[];
}) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            content={
              <CustomChartTooltip
                valueSuffix=" trips"
              />
            }
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
          />
          <Bar
            dataKey="bookings"
            name="Total Requests"
            fill="#8b5cf6"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="completed"
            name="Fulfilled Trips"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// -------------------------------------------------------------
// 5. Owner Net Earnings Trend (Smooth Area / Line)
// -------------------------------------------------------------
export function OwnerEarningsLineChart({
  data,
}: {
  data: { month: string; earnings: number; trips: number }[];
}) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="ownerEarningsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            content={
              <CustomChartTooltip
                valueSuffix=" ETB"
              />
            }
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
          />
          <Area
            type="monotone"
            dataKey="earnings"
            name="Net Payout (90%)"
            stroke="#059669"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#ownerEarningsGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// -------------------------------------------------------------
// 6. Owner Reservation Status Breakdown (Donut Pie)
// -------------------------------------------------------------
export function OwnerBookingStatusPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              content={
                <CustomChartTooltip
                  valueSuffix=" bookings"
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{total}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. Owner Revenue Distribution by Vehicle (Bar / Donut)
// -------------------------------------------------------------
export function OwnerCarRevenueBarChart({
  data,
}: {
  data: { carName: string; revenue: number; days: number }[];
}) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <YAxis
            type="category"
            dataKey="carName"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            content={
              <CustomChartTooltip
                valueSuffix=" ETB"
              />
            }
          />
          <Bar
            dataKey="revenue"
            name="Earned Revenue"
            fill="#059669"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
