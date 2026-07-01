import { useRef, useState } from 'react';

/**
 * Nén ảnh bằng canvas API
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export async function compressImage(file) {
  const MAX_WIDTH = 1920;
  const QUALITY = 0.8;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Không thể nén ảnh'));
        },
        'image/jpeg',
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể đọc ảnh'));
    };

    img.src = url;
  });
}

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

/**
 * ImageUploader
 * Props:
 *   files: { file: File, preview: string, compressed: Blob }[]
 *   onChange: (newFiles) => void
 */
export default function ImageUploader({ files = [], onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const processFiles = async (incoming) => {
    setError('');
    const remaining = MAX_FILES - files.length;
    if (remaining <= 0) {
      setError(`Chỉ được tải tối đa ${MAX_FILES} ảnh.`);
      return;
    }

    const candidates = Array.from(incoming).slice(0, remaining);
    
    // Ràng buộc định dạng ảnh: jpg, jpeg, png
    const formatValid = candidates.filter(f => {
      const isFormatOk = ['image/jpeg', 'image/png', 'image/jpg'].includes(f.type) || 
                         /\.(jpe?g|png)$/i.test(f.name);
      if (!isFormatOk) {
        setError('Có vẻ ảnh bạn tải lên không phải là ảnh chụp tin nhắn');
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Ảnh "${f.name}" vượt quá ${MAX_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    if (formatValid.length === 0) return;

    const processed = [];
    for (const f of formatValid) {
      try {
        const compressed = await compressImage(f);
        const preview = URL.createObjectURL(f);
        processed.push({ file: f, preview, compressed });
      } catch (err) {
        setError(`Lỗi khi xử lý ảnh "${f.name}": ${err.message}`);
      }
    }

    if (processed.length > 0) {
      onChange([...files, ...processed]);
    }
  };

  const handleInput = (e) => {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const handleRemove = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    URL.revokeObjectURL(files[idx].preview);
    onChange(updated);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`uploader-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Tải ảnh lên"
      >
        <span className="uploader-icon">📷</span>
        <p className="uploader-text">Nhấn để chọn ảnh hoặc kéo thả vào đây</p>
        <p className="uploader-sub">Hỗ trợ tối đa 5 ảnh chụp màn hình</p>
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleInput}
      />

      {/* Error */}
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: 8 }}>
          ⚠️ {error}
        </p>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="uploader-preview-grid">
          {files.map((item, idx) => (
            <div key={idx} className="preview-item">
              <img src={item.preview} alt={`Ảnh ${idx + 1}`} />
              <button
                className="preview-remove"
                onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                aria-label="Xóa ảnh"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Đã chọn {files.length}/{MAX_FILES} ảnh
        </p>
      )}
    </div>
  );
}
