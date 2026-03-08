import { useEffect, useState } from 'react';
import { createAlertStream } from '../services/api';

/**
 * Persistent global SSE alert toast — appears at top of screen when a
 * danger alert is pushed from the backend weather refresher.
 * Props: beaches (string[]) — list of city keys to subscribe to
 */
export default function SSEAlertToast({ beaches = [] }) {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (!beaches.length) return;
        const es = createAlertStream(
            beaches,
            (msg) => {
                if (msg.type === 'danger_alert' && msg.newDangers?.length) {
                    const id = Date.now();
                    setAlerts(prev => [
                        { id, beachName: msg.beachName, dangers: msg.newDangers, ts: msg.timestamp },
                        ...prev.slice(0, 4)          // keep max 5
                    ]);
                    // auto-dismiss after 12 s
                    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 12000);
                }
            },
            () => { } // silent reconnect on error
        );
        return () => es.close();
    }, [beaches.join(',')]);

    if (!alerts.length) return null;

    return (
        <div className="sse-toast-container">
            {alerts.map((a) => (
                <div key={a.id} className="sse-toast">
                    <div className="sse-toast-header">
                        <span className="sse-toast-dot" />
                        <strong>⚠️ Live Alert — {a.beachName}</strong>
                        <button className="sse-toast-close" onClick={() =>
                            setAlerts(prev => prev.filter(x => x.id !== a.id))
                        }>✕</button>
                    </div>
                    {a.dangers.map((d, i) => (
                        <p key={i} className="sse-toast-msg">{d.message}</p>
                    ))}
                </div>
            ))}
        </div>
    );
}
