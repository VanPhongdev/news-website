import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-[#0b1219] border-t border-slate-200 dark:border-[#283039] pt-12 pb-8 px-4 lg:px-10 mt-10">
            <div className="max-w-[1280px] mx-auto flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <div className="size-6 text-primary">
                                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v6H6V8zm2 2v2h4v-2H8zm-2 6h12v2H6v-2zm10-6h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold">TinTức24h</span>
                        </div>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">
                            Trang thông tin điện tử tổng hợp, cập nhật liên tục 24/7. Mang đến cho bạn những góc nhìn đa chiều về mọi mặt của đời sống.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <div className="text-text-secondary">
                                <span className="material-symbols-outlined">public</span>
                            </div>
                            <div className="text-text-secondary">
                                <span className="material-symbols-outlined">chat_bubble</span>
                            </div>
                            <div className="text-text-secondary">
                                <span className="material-symbols-outlined">rss_feed</span>
                            </div>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">Chuyên Mục</h4>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">Thời sự</p>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">Kinh doanh</p>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">Công nghệ</p>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">Thể thao</p>
                    </div>

                    {/* Links Column 2 */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">Thông Tin</h4>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">Về chúng tôi</p>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">Liên hệ quảng cáo</p>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">Điều khoản sử dụng</p>
                        <p className="text-slate-500 dark:text-text-secondary text-sm">Chính sách bảo mật</p>
                    </div>

                    {/* Contact Column */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">Liên Hệ</h4>
                        <p className="text-slate-500 dark:text-text-secondary text-sm flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">location_on</span>
                            Tòa nhà T24, Phường Thanh Khê, TP. Đà Nẵng
                        </p>
                        <p className="text-slate-500 dark:text-text-secondary text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] shrink-0">call</span>
                            (028) 3838 8383
                        </p>
                        <p className="text-slate-500 dark:text-text-secondary text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] shrink-0">mail</span>
                            contact@tintuc24h.com
                        </p>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
