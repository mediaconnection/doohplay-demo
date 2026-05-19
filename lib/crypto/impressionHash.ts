import { sha256 } from "./hash";

export function generateImpressionHash(data: {

  screen_id: string;

  campaign_id: string;

  creative_id: string;

  played_at: string;

  device_id: string;

}) {

  return sha256(
    JSON.stringify({
      screen_id: data.screen_id,
      campaign_id: data.campaign_id,
      creative_id: data.creative_id,
      played_at: data.played_at,
      device_id: data.device_id
    })
  );

}