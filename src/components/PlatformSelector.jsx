import { useState } from 'react';
import smsIcon from '../assets/sms.png';
import zaloIcon from '../assets/Icon_of_Zalo.png';
import fbIcon from '../assets/Facebook_f_logo_(2019).png';
import telegramIcon from '../assets/Telegram_2019_Logo.png';

const PLATFORMS = [
  { id: 'sms', icon: smsIcon, emoji: '📱', label: 'SMS' },
  { id: 'zalo', icon: zaloIcon, emoji: '💬', label: 'Zalo' },
  { id: 'facebook', icon: fbIcon, emoji: '📘', label: 'Facebook' },
  { id: 'telegram', icon: telegramIcon, emoji: '✈️', label: 'Telegram' },
  { id: 'other', emoji: '✏️', label: 'Khác' },
];

/**
 * PlatformSelector
 * Props:
 *   value: string (platform id hoặc tên tự nhập nếu "other")
 *   onChange: (value: string) => void
 */
export default function PlatformSelector({ value, onChange }) {
  const [customName, setCustomName] = useState('');

  const isOtherSelected = value === 'other' || (
    value && !PLATFORMS.slice(0, 4).find(p => p.id === value)
  );

  const handleSelect = (id) => {
    if (id === 'other') {
      onChange('other');
    } else {
      onChange(id);
    }
  };

  const handleCustomChange = (e) => {
    setCustomName(e.target.value);
    onChange(e.target.value || 'other');
  };

  const getSelectedId = () => {
    const match = PLATFORMS.find(p => p.id === value);
    if (match) return match.id;
    if (isOtherSelected) return 'other';
    return null;
  };

  const selectedId = getSelectedId();
  const [isOpen, setIsOpen] = useState(false);
  const selectedPlatform = PLATFORMS.find(p => p.id === selectedId);

  return (
    <div>
      {/* Custom Select Box for Mobile */}
      <div className="platform-mobile-select-custom">
        <button
          type="button"
          className="custom-select-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedPlatform ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedPlatform.icon ? (
                <img src={selectedPlatform.icon} alt={selectedPlatform.label} className="platform-icon-sm" />
              ) : (
                <span className="platform-emoji-sm">{selectedPlatform.emoji}</span>
              )}
              <span>{selectedPlatform.label}</span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>-- Chọn ứng dụng nhận tin nhắn --</span>
          )}
          <span className="arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
        </button>

        {isOpen && (
          <ul className="custom-select-options">
            {PLATFORMS.map((platform) => (
              <li key={platform.id}>
                <button
                  type="button"
                  className={`custom-option-item ${selectedId === platform.id ? 'selected' : ''}`}
                  onClick={() => {
                    handleSelect(platform.id);
                    setIsOpen(false);
                  }}
                >
                  {platform.icon ? (
                    <img src={platform.icon} alt={platform.label} className="platform-icon-sm" />
                  ) : (
                    <span className="platform-emoji-sm">{platform.emoji}</span>
                  )}
                  <span>{platform.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Grid for Desktop */}
      <div className="platform-grid">
        {PLATFORMS.map((platform) => (
          <button
            key={platform.id}
            type="button"
            className={`platform-card ${selectedId === platform.id ? 'selected' : ''}`}
            onClick={() => handleSelect(platform.id)}
          >
            {platform.icon ? (
              <img src={platform.icon} alt={platform.label} className="platform-icon" />
            ) : (
              <span className="platform-emoji">{platform.emoji}</span>
            )}
            <span>{platform.label}</span>
          </button>
        ))}
      </div>

      {isOtherSelected && (
        <input
          type="text"
          className="platform-other-input"
          placeholder="Nhập tên ứng dụng / kênh nhận tin..."
          value={customName}
          onChange={handleCustomChange}
          autoFocus
        />
      )}
    </div>
  );
}
