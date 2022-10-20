import { useEffect, useState } from 'react';
import type { Analytics} from '@june-so/analytics-next';
import { AnalyticsBrowser } from '@june-so/analytics-next';

export function useJune(writeKey: string) {
  const [analytics, setAnalytics] = useState<Analytics>(undefined);

  useEffect(() => {
    const loadAnalytics = async () => {
      let [response] = await AnalyticsBrowser.load({
        writeKey,
      });
      console.log("ANALYTICS INITIALIZED")
      setAnalytics(response);
    };
    loadAnalytics();
  }, [writeKey]);

  return analytics;
}