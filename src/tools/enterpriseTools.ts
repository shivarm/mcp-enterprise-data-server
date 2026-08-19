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

import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
  enterpriseData,
  findCustomerById,
  getAccountOverview,
  getOrdersForCustomer,
  searchCustomers,
} from "../utils/enterpriseData.js";

export function registerEnterpriseTools(server: McpServer) {
  server.registerTool(
    "get_company_overview",
    {
      title: "Get company overview",
      description:
        "Retrieve enterprise account KPIs and account-level summary data.",
      inputSchema: z.object({
        includeCustomers: z.boolean().default(false),
      }),
    },
    async ({ includeCustomers = false }) => {
      const overview = getAccountOverview();
      const payload = includeCustomers
        ? { ...overview, customers: enterpriseData.customers }
        : overview;

      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    },
  );

  server.registerTool(
    "search_customers",
    {
      title: "Search customers",
      description:
        "Search the customer directory by name, ID, region, or industry.",
      inputSchema: z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(10).default(5),
      }),
    },
    async ({ query, limit }) => {
      const customers = searchCustomers(query, limit);
      const payload = { query, results: customers, total: customers.length };

      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    },
  );

  server.registerTool(
    "get_customer_detail",
    {
      title: "Get customer detail",
      description:
        "Fetch the full profile for a specific customer, including recent account health metrics.",
      inputSchema: z.object({
        customerId: z.string().min(1),
      }),
    },
    async ({ customerId }) => {
      const customer = findCustomerById(customerId);

      if (!customer) {
        return {
          content: [
            { type: "text", text: `Customer ${customerId} not found.` },
          ],
          structuredContent: { customerId, found: false },
        };
      }

      const recentOrders = getOrdersForCustomer(customer.id, 3);
      const payload = {
        customer,
        recentOrders,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    },
  );

  server.registerTool(
    "get_customer_orders",
    {
      title: "Get customer orders",
      description: "Return recent order history for a customer.",
      inputSchema: z.object({
        customerId: z.string().min(1),
        limit: z.number().int().min(1).max(20).default(5),
      }),
    },
    async ({ customerId, limit }) => {
      const customer = findCustomerById(customerId);
      const orders = getOrdersForCustomer(customerId, limit);
      const payload = {
        customerId,
        customerName: customer?.name ?? "Unknown customer",
        totalOrders: orders.length,
        orders,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    },
  );
}
