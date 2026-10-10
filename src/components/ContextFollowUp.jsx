import { useEffect, useState } from 'react';

export default function ContextFollowUp({ result, busy, onContinue, onDiscard }) {
  const invalid = result.assessment?.status === 'invalid_input';
  const [sentReply, setSentReply] = useState(result.suggestedReply?.text || '');
  const [senderReply, setSenderReply] = useState('');
  const [image, setImage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [skipSuggestion, setSkipSuggestion] = useState(false);
  const [error, setError] = useState('');
  const canCopy = result.allowedActions?.includes('copy_suggested_reply') && Boolean(result.suggestedReply?.text);

  useEffect(() => {
    setSentReply(result.suggestedReply?.text || '');
    setSenderReply('');
    setImage(null);
    setCopied(false);
    setHasSent(false);
    setSkipSuggestion(false);
    setError('');
  }, [result.scanSessionId, result.suggestedReply?.round]);

  const copyReply = async () => {
    try {
      await navigator.clipboard.writeText(sentReply.trim());
      setCopied(true);
      setError('');
    } catch {
      setError('Không sao chép được. Bạn có thể chọn và sao chép đoạn chữ phía trên.');
    }
  };

  const continueScan = () => {
    if (!senderReply.trim() && !image) {
      setError('Hãy dán câu trả lời mới hoặc chọn ảnh chụp đoạn chat.');
      return;
    }
    setError('');
    onContinue({ sentReply: hasSent ? sentReply.trim() : '', senderReply: senderReply.trim(), image });
  };

  return (
    <section className="bg-surface-container border border-warning/40 p-space-lg shadow-md space-y-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-warning text-3xl">help_outline</span>
        <div>
          <h2 className="font-headline-sm font-bold text-on-surface">{invalid ? 'Chưa đọc được nội dung' : 'Chưa đủ ngữ cảnh để kết luận'}</h2>
          <p className="text-sm text-on-surface-variant mt-1">{result.assessment?.reason || 'Hãy lấy thêm thông tin trước khi đánh giá.'}</p>
          <p className="text-xs text-warning mt-2">{invalid ? 'Hãy chụp lại ảnh rõ hơn hoặc dán nội dung tin nhắn để quét lại.' : 'Chưa thể xác nhận tin này an toàn. Hệ thống chưa lưu nó thành mẫu kết luận.'}</p>
        </div>
      </div>

      {!invalid && canCopy && !skipSuggestion && (
        <div className="border border-white/10 bg-white p-4 space-y-3">
          <label htmlFor="suggested-reply" className="block text-sm font-semibold">AI gợi ý bạn hỏi lại người gửi</label>
          <textarea id="suggested-reply" value={sentReply} maxLength={160} rows={2}
            onChange={(event) => setSentReply(event.target.value)}
            className="w-full border border-white/20 bg-surface p-3 text-sm" />
          <p className="text-xs text-on-surface-variant">Nếu đây là số/tài khoản lạ, việc trả lời có thể xác nhận bạn đang hoạt động. Bạn có thể bỏ qua bước này.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyReply} disabled={!sentReply.trim() || busy}
              className="bg-primary-container text-white px-4 py-2 text-sm font-semibold disabled:opacity-50">
              {copied ? 'Đã sao chép' : 'Sao chép tin nhắn'}
            </button>
            <button type="button" onClick={() => setHasSent(true)} disabled={busy}
              className="border border-white/20 bg-white px-4 py-2 text-sm font-semibold">
              {hasSent ? 'Đã đánh dấu đã gửi' : 'Tôi đã gửi'}
            </button>
            <button type="button" onClick={() => setSkipSuggestion(true)} disabled={busy}
              className="border border-white/20 bg-white px-4 py-2 text-sm font-semibold">
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {!invalid && <div className="border border-white/10 bg-white p-4 space-y-3">
        <h3 className="text-sm font-semibold">Khi có tin nhắn mới, quét tiếp cuộc trò chuyện</h3>
        <label htmlFor="sender-reply" className="block text-xs text-on-surface-variant">Dán phản hồi mới của người gửi</label>
        <textarea id="sender-reply" value={senderReply} rows={3}
          onChange={(event) => setSenderReply(event.target.value)}
          placeholder="Dán đúng nội dung mới, không nhập OTP hoặc thông tin riêng tư của bạn"
          className="w-full border border-white/20 bg-surface p-3 text-sm" />
        <label htmlFor="followup-image" className="block text-xs text-on-surface-variant">Hoặc chọn ảnh chụp mới (JPEG/PNG, tối đa 10 MB)</label>
        <input id="followup-image" type="file" accept="image/jpeg,image/png" disabled={busy}
          onChange={(event) => setImage(event.target.files?.[0] || null)}
          className="block w-full text-xs" />
        <button type="button" onClick={continueScan} disabled={busy}
          className="w-full bg-primary-container text-white px-4 py-3 text-sm font-bold disabled:opacity-50">
          {busy ? 'Đang phân tích lại...' : 'Phân tích lại với ngữ cảnh mới'}
        </button>
        {error && <p role="alert" className="text-xs text-error">{error}</p>}
      </div>}
      {!invalid && <p className="text-xs text-on-surface-variant">Lời người gửi tự khai không chứng minh danh tính. Nếu họ yêu cầu tiền, OTP hoặc truy cập liên kết, hãy dừng phản hồi và xác minh qua kênh chính thức.</p>}
      <button type="button" onClick={onDiscard} disabled={busy}
        className="border border-white/20 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">
        Xóa phiên quét
      </button>
    </section>
  );
}
