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

import { z } from "zod";

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.enum(["Standard", "Enterprise"]),
  status: z.enum(["Active", "Suspended"]),
});

export type Customer = z.infer<typeof CustomerSchema>;

export const enterpriseDataStore: Customer[] = [
  { id: "CUST-001", name: "Acme Corp", tier: "Enterprise", status: "Active" },
  { id: "CUST-002", name: "Stark Tech", tier: "Enterprise", status: "Active" },
  { id: "CUST-003", name: "Wayne Ent", tier: "Standard", status: "Suspended" },
];
