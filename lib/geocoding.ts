/**
 * lib/geocoding.ts
 *
 * Geocodificação de endereços via Nominatim (OpenStreetMap) — gratuito, sem API key.
 * Respeita o rate limit oficial do Nominatim (máx. 1 requisição por segundo).
 *
 * Uso:
 *   const result = await geocodeAddress("Rua Exemplo, 123, Bairro X", "São Paulo");
 *   if (result) { console.log(result.latitude, result.longitude); }
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  source: "nominatim";
  displayName: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim exige um User-Agent identificável (política de uso deles)
const USER_AGENT = "DoohplayApp/1.0 (contato@doohplay.com.br)";

/**
 * Geocodifica um endereço único.
 * Retorna null se não encontrar resultado ou se a requisição falhar.
 */
export async function geocodeAddress(
  address: string,
  city?: string
): Promise<GeocodeResult | null> {
  const query = [address, city, "Brasil"].filter(Boolean).join(", ");

  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "br",
  });

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      console.error(`[geocoding] Nominatim retornou status ${response.status} para: ${query}`);
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[geocoding] Nenhum resultado encontrado para: ${query}`);
      return null;
    }

    const best = data[0];

    return {
      latitude: parseFloat(best.lat),
      longitude: parseFloat(best.lon),
      source: "nominatim",
      displayName: best.display_name,
    };
  } catch (err) {
    console.error(`[geocoding] Erro ao geocodificar "${query}":`, err);
    return null;
  }
}

/**
 * Aguarda o tempo mínimo entre requisições ao Nominatim (1 req/segundo).
 * Use isso entre chamadas quando geocodificar múltiplos endereços em lote.
 */
export function nominatimDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1100)); // 1.1s de margem de segurança
}

/**
 * Calcula a distância em km entre duas coordenadas (fórmula de Haversine).
 * Usado para filtrar parceiros dentro do raio de 5km do Clube de Telas.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // raio da Terra em km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
