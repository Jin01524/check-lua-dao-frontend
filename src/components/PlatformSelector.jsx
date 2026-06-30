import { useState } from 'react';
import smsIcon from '../assets/sms.png';
import zaloIcon from '../assets/Icon_of_Zalo.png';
import fbIcon from '../assets/Facebook_f_logo_(2019).png';

const PLATFORMS = [
  { id: 'sms', icon: smsIcon, label: 'SMS' },
  { id: 'zalo', icon: zaloIcon, label: 'Zalo' },
  { id: 'facebook', icon: fbIcon, label: 'Facebook' },
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
    value && !PLATFORMS.slice(0, 3).find(p => p.id === value)
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

  return (
    <div>
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
