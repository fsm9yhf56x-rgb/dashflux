export default function LoadingSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk {
          background: linear-gradient(
            90deg,
            rgba(212,214,226,0.25) 25%,
            rgba(124,58,237,0.07)  50%,
            rgba(212,214,226,0.25) 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
          border-radius: 10px;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Stats bar */}
        <div style={{
          height: 36, borderRadius: 12,
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,214,226,0.6)',
          overflow: 'hidden',
        }} className="sk"/>

        {/* MacroRegime */}
        <div style={{
          height: 64, borderRadius: 18,
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(212,214,226,0.6)',
          overflow: 'hidden',
        }} className="sk"/>

        {/* TopEmergents */}
        <div style={{
          borderRadius: 20,
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(212,214,226,0.6)',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div className="sk" style={{ height: 18, width: 140, borderRadius: 8 }}/>
          {[0, 1, 2].map(i => (
            <div key={i} className="sk" style={{
              height: 52, borderRadius: 12,
              animationDelay: `${i * 0.12}s`,
            }}/>
          ))}
        </div>

        {/* ScoresTable */}
        <div style={{
          borderRadius: 20,
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(212,214,226,0.6)',
          padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <div className="sk" style={{ height: 16, width: 160, borderRadius: 8 }}/>
            <div className="sk" style={{ height: 16, width: 80, borderRadius: 8, marginLeft: 'auto' }}/>
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="sk" style={{
              height: 44, borderRadius: 10,
              animationDelay: `${i * 0.07}s`,
              opacity: 1 - i * 0.08,
            }}/>
          ))}
        </div>

      </div>
    </>
  );
}