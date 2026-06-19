/**
 * app/api/admin/geocode-clients/route.ts
 *
 * Geocodifica em batch todos os clientes de studio_clients que ainda
 * não possuem registro em client_locations.
 *
 * Uso: POST /api/admin/geocode-clients
 * (proteger com sessão/admin auth conforme padrão já usado nas outras rotas admin)
 *
 * Retorna um resumo: quantos geocodificados com sucesso, quantos falharam, e detalhes.
 */

import { NextResponse } from "next/server";
import { Pool } from "pg";
import { geocodeAddress, nominatimDelay } from "@/lib/geocoding";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface ClientToGeocode {
  code: string;
  name: string;
  address: string | null;
  city: string | null;
}

interface GeocodeOutcome {
  code: string;
  name: string;
  status: "success" | "skipped_no_address" | "failed_not_found" | "failed_error";
  latitude?: number;
  longitude?: number;
}

export async function POST() {
  const client = await pool.connect();

  try {
    // Busca clientes ativos que ainda não têm geocodificação
    const { rows: pendingClients } = await client.query<ClientToGeocode>(
      `
      SELECT sc.code, sc.name, sc.address, sc.city
      FROM studio_clients sc
      LEFT JOIN client_locations cl ON cl.client_code = sc.code
      WHERE sc.active = true
        AND cl.id IS NULL
      `
    );

    const results: GeocodeOutcome[] = [];

    for (const pending of pendingClients) {
      if (!pending.address || pending.address.trim() === "") {
        results.push({
          code: pending.code,
          name: pending.name,
          status: "skipped_no_address",
        });
        continue;
      }

      const geocoded = await geocodeAddress(pending.address, pending.city ?? undefined);

      if (!geocoded) {
        results.push({
          code: pending.code,
          name: pending.name,
          status: "failed_not_found",
        });
      } else {
        await client.query(
          `
          INSERT INTO client_locations (client_code, latitude, longitude, geocode_source)
          VALUES ($1, $2, $3, 'nominatim')
          ON CONFLICT (client_code) DO UPDATE
            SET latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                geocoded_at = now(),
                geocode_source = 'nominatim'
          `,
          [pending.code, geocoded.latitude, geocoded.longitude]
        );

        results.push({
          code: pending.code,
          name: pending.name,
          status: "success",
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
        });
      }

      // Respeita o rate limit do Nominatim (1 req/s) entre cada cliente
      await nominatimDelay();
    }

    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === "success").length,
      skipped_no_address: results.filter((r) => r.status === "skipped_no_address").length,
      failed_not_found: results.filter((r) => r.status === "failed_not_found").length,
    };

    return NextResponse.json({ summary, results });
  } catch (err) {
    console.error("[geocode-clients] Erro no batch:", err);
    return NextResponse.json(
      { error: "Erro ao processar geocodificação em batch" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
