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

import { type McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import {
  enterpriseData,
  findCustomerById,
  getAccountOverview,
} from "../utils/enterpriseData.js";

export function registerResources(server: McpServer) {
  // 1. Static Resource: Company KPI Overview
  server.registerResource(
    "company_overview",
    "enterprise://overview",
    {
      title: "Company Overview",
      description: "Retrieve enterprise account KPIs and summary metrics.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getAccountOverview(), null, 2),
        },
      ],
    }),
  );

  // 2. Static Resource: Raw Enterprise Snapshot
  server.registerResource(
    "enterprise_snapshot",
    "enterprise://snapshot",
    {
      title: "Enterprise Snapshot",
      description: "Full raw dataset snapshot.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(enterpriseData, null, 2),
        },
      ],
    }),
  );

  // 3. Dynamic Resource: Customer Profile by URI Parameter
  server.registerResource(
    "customer_detail",
    new ResourceTemplate("enterprise://customers/{customerId}", {
      list: undefined,
    }),
    {
      title: "Customer Profile",
      description: "Fetch customer details by URI path.",
      mimeType: "application/json",
    },
    async (uri, params) => {
      // Extract raw param and resolve arrays/undefined down to a strict string
      const rawId = params.customerId;
      const targetId = (Array.isArray(rawId) ? rawId[0] : rawId) || "";

      if (!targetId) {
        throw new Error("Customer ID is required in URI path.");
      }

      const customer = findCustomerById(targetId);

      if (!customer) {
        throw new Error(`Customer ${targetId} not found.`);
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(customer, null, 2),
          },
        ],
      };
    },
  );
}
