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
import { enterpriseData, getAccountOverview } from "../utils/enterpriseData.js";

export function registerEnterpriseResources(server: McpServer) {
  server.registerResource(
    "company-overview",
    "enterprise://company/overview",
    {
      title: "Company overview",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "enterprise://company/overview",
          mimeType: "application/json",
          text: JSON.stringify(getAccountOverview(), null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "customer-directory",
    "enterprise://customers",
    {
      title: "Customer directory",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "enterprise://customers",
          mimeType: "application/json",
          text: JSON.stringify(
            enterpriseData.customers.map(
              ({ id, name, tier, region, industry, active, healthScore }) => ({
                id,
                name,
                tier,
                region,
                industry,
                active,
                healthScore,
              }),
            ),
            null,
            2,
          ),
        },
      ],
    }),
  );
}
