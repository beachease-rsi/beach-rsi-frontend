import { getSuitabilityColor, ACTIVITY_ICONS } from '../services/api';

/**
 * Shows a single activity's suitability (Ideal / Caution / Danger / N/A)
 * Props: activity (string), label (string), score (number)
 */
export default function ActivityBadge({ activity, label, score }) {
    const color = getSuitabilityColor(label);
    const icon = ACTIVITY_ICONS[activity] || '🏖️';

    return (
        <div className="activity-badge">
            <div className="activity-badge-left">
                <span className="activity-badge-icon">{icon}</span>
                <span className="activity-badge-name">
                    {activity.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
            </div>
            <div className="activity-badge-right">
                {score !== undefined && (
                    <div className="activity-badge-bar">
                        <div className="activity-badge-fill" style={{ width: `${score}%`, background: color }} />
                    </div>
                )}
                <span className="activity-badge-label" style={{ color, borderColor: color }}>
                    {label || 'N/A'}
                </span>
            </div>
        </div>
    );
}
