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
import { ResourceTemplate } from "@modelcontextprotocol/server";
import { enterpriseDataStore } from "../data/enterpriseData.js";

export function registerResources(server: McpServer) {
  // Static Resource
  server.registerResource(
    "enterprise-customers",
    "enterprise://customers",
    {
      description: "Enterprise Customers List",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(enterpriseDataStore, null, 2),
          mimeType: "application/json",
        },
      ],
    }),
  );

  // Dynamic Resource
  server.registerResource(
    "customer-by-id",
    new ResourceTemplate("enterprise://customers/{id}", { list: undefined }),
    {
      description: "Customer By ID",
      mimeType: "application/json",
    },
    async (uri, { id }) => {
      const customer = enterpriseDataStore.find((c) => c.id === id);

      if (!customer) {
        throw new Error(`Customer ${id} not found.`);
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(customer, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    },
  );
}
