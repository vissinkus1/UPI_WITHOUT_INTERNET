'use client';
import { useRef, useEffect } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';

export default function ActivityLog({ logs }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  const getLogClass = (type) => {
    switch (type) {
      case 'inject': return 'log-inject';
      case 'gossip': return 'log-gossip';
      case 'bridge': return 'log-bridge';
      case 'settled': return 'log-settled';
      case 'duplicate': return 'log-duplicate';
      case 'error': return 'log-error';
      case 'reset': return 'log-reset';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader icon="🪵">Activity Log</CardHeader>
      <div ref={scrollRef} className="terminal-log">
        {logs.length === 0 ? (
          <div className="text-[var(--text-muted)] text-center py-4">
            Waiting for actions...
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="log-entry">
              <span className="log-time">[{log.time}]</span>
              <span className={getLogClass(log.type)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
