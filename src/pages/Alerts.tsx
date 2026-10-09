import React from 'react';
import { AlertCard } from '../components/common/AlertCard';
import { Card } from '../components/common/Card';
import { TierBadge } from '../components/common/TierBadge';
import { mockAlerts } from '../mock/vieraBakeryData';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Alerts: React.FC = () => {
  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Financial & Cash Alerts</h2>
          <p className="text-xs text-slate-400">Proactive risk detection and anomaly flags</p>
        </div>
        <TierBadge tier="T1" size="sm" />
      </div>

      <div className="space-y-3">
        {mockAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            level={alert.level}
            title={alert.title}
            detail={alert.detail}
            suggestedAction={alert.suggestedAction}
            actionRoute={alert.actionRoute}
          />
        ))}
      </div>
    </div>
  );
};
