
import { useState, useEffect } from 'react';
import { connectionManager } from '@/services/ConnectionManager';

interface ConnectionStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageResponseTime: number;
  peakConnections: number;
  activeConnections: number;
  queuedQueries: number;
  successRate: number;
}

export function useConnectionMonitor() {
  const [stats, setStats] = useState<ConnectionStats>({
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageResponseTime: 0,
    peakConnections: 0,
    activeConnections: 0,
    queuedQueries: 0,
    successRate: 0
  });

  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStats = connectionManager.getStats();
      setStats(currentStats);

      // Check for alerts
      const newAlerts: string[] = [];
      
      if (currentStats.activeConnections >= 6) { // 75% of max connections
        newAlerts.push('High connection usage detected');
      }
      
      if (currentStats.queuedQueries > 10) {
        newAlerts.push('Query queue is building up');
      }
      
      if (currentStats.successRate < 90 && currentStats.totalQueries > 10) {
        newAlerts.push('Low success rate detected');
      }
      
      if (currentStats.averageResponseTime > 5000) {
        newAlerts.push('High response times detected');
      }

      setAlerts(newAlerts);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { stats, alerts };
}
