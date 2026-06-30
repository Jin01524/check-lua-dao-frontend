import logoSdc from '../assets/logo-sdc.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          {/* Logo & SDC Info */}
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <img src={logoSdc} alt="SDC Logo" className="footer-sdc-logo" />
              <div>
                <h3 className="footer-title">TRUNG TÂM PHÁT TRIỂN PHẦN MỀM</h3>
                <h4 className="footer-subtitle">ĐẠI HỌC ĐÀ NẴNG (SDC)</h4>
              </div>
            </div>
            <p className="footer-desc">
              Hệ thống hỗ trợ phân tích và phát hiện các mẫu tin nhắn lừa đảo bằng công nghệ AI tiên tiến, góp phần nâng cao nhận thức bảo mật và phòng chống lừa đảo trực tuyến tại Việt Nam.
            </p>
          </div>

          {/* Developer Info */}
          <div className="footer-dev">
            <h3 className="footer-section-title">Thông tin phát triển</h3>
            <div className="footer-info-list">
              <p className="footer-info-item"><strong>Sinh viên thực hiện:</strong> Võ Ngọc Bình</p>
              <p className="footer-info-item"><strong>Trường:</strong> Đại học Kiến trúc Đà Nẵng</p>
              <p className="footer-info-item">
                <strong>Email:</strong>{' '}
                <a href="mailto:ngocbinhdt1999@gmail.com" className="footer-link">
                  ngocbinhdt1999@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Safety disclaimer */}
          <div className="footer-safety">
            <h3 className="footer-section-title">Lưu ý an toàn</h3>
            <p className="footer-desc" style={{ fontSize: '0.85rem', color: '#a4b0be' }}>
              Dữ liệu phân tích chỉ phục vụ mục đích học tập và cảnh báo cộng đồng. Vui lòng tự che/xóa các thông tin cá nhân đặc biệt nhạy cảm trước khi chụp màn hình gửi kiểm tra.
            </p>
            <div className="footer-copyright">
              © {new Date().getFullYear()} CheckLưaĐảo. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
