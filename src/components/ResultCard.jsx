import ChatBubble from './ChatBubble';

/**
 * ResultCard – hiển thị kết quả phân tích từ AI
 * Props:
 *   result: {
 *     isScam: boolean,
 *     scamType: string,
 *     dangerLevel: number (0-100),
 *     warningPoints: string[],
 *     messages: [{ sender, text }],
 *     summary: string,
 *   }
 */
export default function ResultCard({ result }) {
  if (!result) return null;

  const {
    isScam,
    scamType,
    confidenceScore: dangerLevel = 0,
    warningPoints = [],
    messages = [],
    analysis: summary
  } = result;

  const dangerClass =
    dangerLevel < 40 ? 'danger-low' :
    dangerLevel < 70 ? 'danger-medium' :
    'danger-high';

  return (
    <div className="result-card">
      {/* Banner */}
      <div className={`result-banner ${isScam ? 'danger' : 'safe'}`}>
        <span className="result-banner-icon">{isScam ? '⚠️' : '✅'}</span>
        <div>
          <div className="result-banner-title">
            {isScam
              ? 'CẢNH BÁO: Đây có thể là tin nhắn lừa đảo!'
              : 'Tin nhắn này có vẻ an toàn'}
          </div>
          {isScam && scamType && (
            <div className="result-banner-sub">Loại: {scamType}</div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="result-body">
        {/* Danger Level */}
        {isScam && (
          <div className="result-section">
            <div className="result-section-title">Mức độ nguy hiểm</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="danger-level-bar" style={{ flex: 1 }}>
                <div
                  className={`danger-level-fill ${dangerClass}`}
                  style={{ width: `${dangerLevel}%` }}
                />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--danger)', minWidth: 36 }}>
                {dangerLevel}%
              </span>
            </div>
          </div>
        )}

        {/* Summary for safe messages */}
        {!isScam && summary && (
          <div className="result-section">
            <div className="result-section-title">Nhận xét</div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>{summary}</p>
          </div>
        )}

        {/* Warning Points */}
        {isScam && warningPoints.length > 0 && (
          <div className="result-section">
            <div className="result-section-title">Dấu hiệu nhận biết</div>
            <ul className="warning-list">
              {warningPoints.map((point, idx) => (
                <li key={idx} className="warning-item">
                  <span className="warning-item-icon">❌</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Chat Bubbles */}
        {isScam && messages.length > 0 && (
          <div className="result-section">
            <div className="result-section-title">Nội dung tin nhắn</div>
            <div className="chat-container">
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} sender={msg.sender} text={msg.text} />
              ))}
            </div>
          </div>
        )}

        {isScam && (
          <p className="result-note">
            💾 Tin nhắn này đã được lưu lại để chờ quản trị viên xem xét
          </p>
        )}
      </div>
    </div>
  );
}
