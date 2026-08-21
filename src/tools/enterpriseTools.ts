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
import { enterpriseDataStore } from "../data/enterpriseData.js";

export function registerTools(server: McpServer) {
  server.registerTool(
    "get_customer_details",
    {
      description: "Fetch detailed information for a specific customer by ID.",
      inputSchema: z.object({
        customerId: z
          .string()
          .describe("The unique customer identifier (e.g., CUST-001)"),
      }),
    },
    async ({ customerId }) => {
      const customer = enterpriseDataStore.find((c) => c.id === customerId);

      if (!customer) {
        return {
          content: [
            {
              type: "text",
              text: `Customer with ID "${customerId}" not found.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(customer, null, 2),
          },
        ],
      };
    },
  );
}
