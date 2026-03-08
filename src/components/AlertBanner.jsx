export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  const levelClass = { DANGER: 'alert-danger', WARNING: 'alert-warning', CAUTION: 'alert-caution', INFO: 'alert-info' };

  return (
    <div style={{ marginTop: 16 }}>
      {alerts.map((alert, i) => (
        <div key={i} className={`alert-banner ${levelClass[alert.level] || 'alert-info'}`}>
          <span style={{ fontSize: 20 }}>{alert.emoji}</span>
          <div>
            <strong>{alert.title}</strong>
            <p style={{ margin: 0, opacity: 0.85, fontSize: 13 }}>{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
