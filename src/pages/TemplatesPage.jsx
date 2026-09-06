import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { normalizeThreatScore, getConsistentThreatScore, getThreatLevel } from '../utils/threatUtils';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await API.get('/api/templates');
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setTemplates(res.data.data);
        } else {
          setTemplates(DEFAULT_TEMPLATES);
        }
      } catch (err) {
        console.warn('[TemplatesPage] Using offline threat library:', err.message);
        setTemplates(DEFAULT_TEMPLATES);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filtered = templates.filter((tpl) => {
    const matchesSearch =
      !search ||
      tpl.title?.toLowerCase().includes(search.toLowerCase()) ||
      tpl.scam_type?.toLowerCase().includes(search.toLowerCase()) ||
      tpl.platform?.toLowerCase().includes(search.toLowerCase());

    const matchesPlatform =
      selectedPlatform === 'ALL' ||
      tpl.platform?.toLowerCase() === selectedPlatform.toLowerCase();

    return matchesSearch && matchesPlatform;
  });

  return (
    <main className="w-full pt-8 pb-20 bg-surface min-h-screen relative overflow-hidden">
      {/* Background Cyber Orbs */}
      <div className="absolute -top-40 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-80 -left-20 w-80 h-80 bg-error/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <section className="mb-space-xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs bg-surface-container-high rounded-none mb-space-xs border border-white/5">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                <span className="font-label-badge text-label-badge text-error uppercase">
                  CƠ SỞ DỮ LIỆU ĐE DỌA QUỐC GIA
                </span>
                <span className="text-outline text-label-caption">•</span>
                <span className="font-label-badge text-label-badge text-tertiary">
                  MỨC ĐỘ RỦI RO &gt; 60%
                </span>
              </div>
              <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-headline-lg text-on-surface tracking-tight mb-space-2xs font-bold">
                Kho Dữ Liệu Mẫu Tin Nhắn Lừa Đảo Đã Cảnh Báo
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Tập hợp các thủ đoạn tấn công phi kỹ thuật (Social Engineering), tin nhắn mạo danh độc hại đã qua phân tích số bởi hệ thống AI chuyên sâu và kiểm chứng bởi đội ngũ an ninh mạng.
              </p>
            </div>

            {/* Metric Pulse Cards */}
            <div className="flex items-center gap-space-xs bg-surface-container-low p-space-xs rounded-none border border-white/5 self-start lg:self-auto">
              <div className="px-space-sm py-space-2xs bg-surface-container rounded-none">
                <span className="font-label-caption text-label-caption text-on-surface-variant block">Đã xác thực</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{templates.length > 0 ? `${templates.length}+` : '12,840+'}</span>
              </div>
              <div className="px-space-sm py-space-2xs bg-surface-container rounded-none">
                <span className="font-label-caption text-label-caption text-on-surface-variant block">Chặn tức thời</span>
                <span className="font-headline-sm text-headline-sm text-error font-bold">99.4%</span>
              </div>
              <div className="px-space-sm py-space-2xs bg-surface-container rounded-none">
                <span className="font-label-caption text-label-caption text-on-surface-variant block">Trạng thái</span>
                <span className="font-label-badge text-label-badge text-[#10b981] font-bold block mt-1">THỜI GIAN THỰC</span>
              </div>
            </div>
          </div>

          {/* Smart Filter Control Deck */}
          <div className="bg-surface-container-low p-space-md rounded-none shadow-md border border-white/5 space-y-space-md">
            {/* Search Bar */}
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo từ khóa lừa đảo, tên ngân hàng, cơ quan mạo danh, đường dẫn độc hại..."
                className="w-full bg-surface-container text-on-surface text-body-md pl-12 pr-4 py-3 rounded-none border border-white/5 focus:outline-none focus:ring-1 focus:ring-primary placeholder-on-surface-variant/40"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Platform Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
              <span className="text-xs font-label-badge text-on-surface-variant mr-1">NỀN TẢNG:</span>
              {[
                { id: 'ALL', label: 'Tất cả nền tảng' },
                { id: 'sms', label: 'SMS / Brand' },
                { id: 'zalo', label: 'Zalo' },
                { id: 'facebook', label: 'Facebook' },
                { id: 'telegram', label: 'Telegram' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-3 py-1.5 rounded-none text-xs font-title-md transition-colors ${
                    selectedPlatform === p.id
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-surface-container-low rounded-none p-space-lg border border-white/5 animate-pulse min-h-[200px] flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-5 bg-surface-container-high rounded-none"></div>
                  <div className="w-16 h-4 bg-surface-container-high rounded-none"></div>
                </div>
                <div className="w-full h-8 bg-surface-container-high rounded-none my-3"></div>
                <div className="w-32 h-4 bg-surface-container-high rounded-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-error-container/20 border border-error/40 rounded-none text-error mb-6">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-surface-container-low rounded-none p-space-2xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[300px]">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-3">
              folder_off
            </span>
            <div className="font-headline-sm text-on-surface font-semibold">
              Không tìm thấy mẫu tin nhắn phù hợp
            </div>
            <p className="font-body-sm text-on-surface-variant mt-1 max-w-sm">
              Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc nền tảng khác.
            </p>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {filtered.map((tpl) => {
              const id = tpl.id || tpl._id;
              const danger = getConsistentThreatScore(tpl);
              const threat = getThreatLevel(danger);

              return (
                <article
                  key={id}
                  onClick={() => {
                    window.location.href = `/templates/${id}`;
                  }}
                  className="bg-surface-container-low hover:bg-surface-container rounded-none p-space-lg border border-white/5 hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Severity & Case Code */}
                    <div className="flex items-center justify-between mb-space-xs">
                      <span
                        className={`font-label-badge text-label-badge px-2 py-0.5 rounded-none font-bold border ${threat.badgeClass}`}
                      >
                        {threat.level} - {danger}%
                      </span>
                      <span className="font-code-telemetry text-code-telemetry text-outline">
                        #CASE-{String(id).slice(-5).toUpperCase()}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="font-title-md text-title-md text-on-surface font-bold group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                      {tpl.title || tpl.scam_type || 'Mẫu tin nhắn lừa đảo'}
                    </h2>

                    {/* Excerpt / Summary */}
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-space-sm">
                      {tpl.analysis || tpl.summary || tpl.content || 'Chiến dịch lừa đảo mạo danh nhằm chiếm đoạt tài khoản hoặc mã xác thực của người dùng.'}
                    </p>
                  </div>

                  {/* Meta Footer */}
                  <div className="flex items-center justify-between pt-space-xs border-t border-white/5 text-xs text-on-surface-variant font-label-caption">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        {tpl.platform?.toLowerCase() === 'sms'
                          ? 'sms'
                          : tpl.platform?.toLowerCase() === 'zalo'
                          ? 'forum'
                          : tpl.platform?.toLowerCase() === 'facebook'
                          ? 'public'
                          : 'devices_other'}
                      </span>
                      <span className="uppercase">{tpl.platform || 'SMS'}</span>
                    </span>

                    <span className="text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>Xem chi tiết</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
