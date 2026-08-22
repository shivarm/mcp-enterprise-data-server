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

import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  enterpriseData,
  findCustomerById,
  getAccountOverview,
  getOrdersForCustomer,
  searchCustomers,
} from "../utils/enterpriseData.js";

export function registerTools(server: McpServer) {
  // 1. Get Company Overview Tool
  server.registerTool(
    "get_company_overview",
    {
      description: "Retrieve enterprise account KPIs and summary data.",
      inputSchema: z.object({
        includeCustomers: z.boolean().default(false),
      }),
    },
    async ({ includeCustomers }) => {
      const overview = getAccountOverview();
      const payload = includeCustomers
        ? { ...overview, customers: enterpriseData.customers }
        : overview;

      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      };
    }
  );

  // 2. Search Customers Tool
  server.registerTool(
    "search_customers",
    {
      description: "Search customer directory by name, ID, region, or industry.",
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
      };
    }
  );

  // 3. Get Customer Detail Tool
  server.registerTool(
    "get_customer_detail",
    {
      description: "Fetch full customer profile including health metrics.",
      inputSchema: z.object({
        customerId: z.string().min(1),
      }),
    },
    async ({ customerId }) => {
      const customer = findCustomerById(customerId);

      if (!customer) {
        return {
          content: [{ type: "text", text: `Customer ${customerId} not found.` }],
          isError: true,
        };
      }

      const recentOrders = getOrdersForCustomer(customer.id, 3);
      const payload = { customer, recentOrders };

      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      };
    }
  );

  // 4. Get Customer Orders Tool
  server.registerTool(
    "get_customer_orders",
    {
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
      };
    }
  );
}