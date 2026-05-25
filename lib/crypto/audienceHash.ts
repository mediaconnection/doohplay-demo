// @ts-nocheck
import { sha256 } from "./hash";

export function generateAudienceHash(data: {

  screen_id: string

  campaign_id: string

  impression_id: string

  timestamp: string

  viewer_count: number

  confidence: number

  sensor_id: string

}) {

  return sha256(
    JSON.stringify({

      screen_id: data.screen_id,

      campaign_id: data.campaign_id,

      impression_id: data.impression_id,

      timestamp: data.timestamp,

      viewer_count: data.viewer_count,

      confidence: data.confidence,

      sensor_id: data.sensor_id

    })
  );

}
