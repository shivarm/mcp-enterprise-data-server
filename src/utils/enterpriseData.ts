/**
 * mcp-enterprise-data-server
 * Copyright (C) 2026 Shivam Sharma
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

export type CustomerTier = "Gold" | "Platinum" | "Silver";

export type Customer = {
  id: string;
  name: string;
  tier: CustomerTier;
  region: string;
  industry: string;
  healthScore: number;
  active: boolean;
  annualRevenue: number;
  lastOrderDate: string;
};

export type Order = {
  id: string;
  customerId: string;
  orderDate: string;
  total: number;
  status: "Paid" | "Processing" | "Shipped" | "Cancelled";
  channel: "Web" | "Sales" | "Partner";
};

export type EnterpriseSnapshot = {
  company: {
    name: string;
    region: string;
    industry: string;
  };
  metrics: {
    totalCustomers: number;
    activeCustomers: number;
    avgHealthScore: number;
    annualRevenue: number;
  };
  customers: Customer[];
  orders: Order[];
};

export const enterpriseData: EnterpriseSnapshot = {
  company: {
    name: "Northstar Enterprise Systems",
    region: "North America",
    industry: "SaaS & Data Platforms",
  },
  metrics: {
    totalCustomers: 4,
    activeCustomers: 3,
    avgHealthScore: 86,
    annualRevenue: 4820000,
  },
  customers: [
    {
      id: "CUST-1001",
      name: "Helios Labs",
      tier: "Platinum",
      region: "US-East",
      industry: "Biotech",
      healthScore: 94,
      active: true,
      annualRevenue: 1250000,
      lastOrderDate: "2026-08-14",
    },
    {
      id: "CUST-1002",
      name: "Summit Retail Group",
      tier: "Gold",
      region: "US-West",
      industry: "Retail",
      healthScore: 89,
      active: true,
      annualRevenue: 980000,
      lastOrderDate: "2026-08-11",
    },
    {
      id: "CUST-1003",
      name: "Crescent Manufacturing",
      tier: "Silver",
      region: "Canada",
      industry: "Manufacturing",
      healthScore: 78,
      active: true,
      annualRevenue: 720000,
      lastOrderDate: "2026-08-04",
    },
    {
      id: "CUST-1004",
      name: "Atlas Logistics",
      tier: "Gold",
      region: "EMEA",
      industry: "Logistics",
      healthScore: 62,
      active: false,
      annualRevenue: 640000,
      lastOrderDate: "2026-06-18",
    },
  ],
  orders: [
    {
      id: "ORD-9001",
      customerId: "CUST-1001",
      orderDate: "2026-08-14",
      total: 245000,
      status: "Paid",
      channel: "Web",
    },
    {
      id: "ORD-9002",
      customerId: "CUST-1001",
      orderDate: "2026-07-28",
      total: 186500,
      status: "Shipped",
      channel: "Sales",
    },
    {
      id: "ORD-9003",
      customerId: "CUST-1002",
      orderDate: "2026-08-11",
      total: 143200,
      status: "Paid",
      channel: "Web",
    },
    {
      id: "ORD-9004",
      customerId: "CUST-1002",
      orderDate: "2026-07-19",
      total: 98000,
      status: "Processing",
      channel: "Partner",
    },
    {
      id: "ORD-9005",
      customerId: "CUST-1003",
      orderDate: "2026-08-04",
      total: 89200,
      status: "Paid",
      channel: "Sales",
    },
    {
      id: "ORD-9006",
      customerId: "CUST-1004",
      orderDate: "2026-06-18",
      total: 75400,
      status: "Cancelled",
      channel: "Partner",
    },
  ],
};

export function getAccountOverview() {
  const { company, metrics, customers } = enterpriseData;

  return {
    company,
    metrics: {
      ...metrics,
      totalRevenueFormatted: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(metrics.annualRevenue),
    },
    activeCustomerCount: customers.filter((customer) => customer.active).length,
    topCustomer: [...customers].sort(
      (a, b) => b.annualRevenue - a.annualRevenue,
    )[0],
    generatedAt: new Date().toISOString(),
  };
}

export function findCustomerById(customerId: string) {
  return enterpriseData.customers.find(
    (customer) => customer.id.toLowerCase() === customerId.toLowerCase(),
  );
}

export function searchCustomers(query: string, limit = 5) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return enterpriseData.customers.slice(0, limit);
  }

  return enterpriseData.customers
    .filter((customer) => {
      const searchable =
        `${customer.id} ${customer.name} ${customer.region} ${customer.industry}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    })
    .slice(0, limit);
}

export function getOrdersForCustomer(customerId: string, limit = 5) {
  return enterpriseData.orders
    .filter(
      (order) => order.customerId.toLowerCase() === customerId.toLowerCase(),
    )
    .sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    )
    .slice(0, limit);
}
