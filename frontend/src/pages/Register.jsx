import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Register = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra độ dài mật khẩu
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (!agreedToTerms) {
            setError('Vui lòng đồng ý với điều khoản sử dụng');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/auth/register`, {
                displayName: formData.displayName,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full bg-background-light font-display">

            {/* Main Content */}
            <div className="flex items-center justify-center w-full p-4 py-20">
                <div className="w-full max-w-[520px] bg-white rounded-xl shadow-md border border-[#e5e7eb] overflow-hidden">
                    {/* Registration Header */}
                    <div className="p-8 pb-0 text-center">
                        <h1 className="text-[#111418] text-2xl font-bold mb-2">Đăng ký tài khoản</h1>
                        <p className="text-[#637588] text-sm">Tạo tài khoản để cập nhật tin tức nóng hổi mỗi ngày</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Display Name Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] text-sm font-medium">Họ và tên</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#637588]">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </span>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#dbe0e6] bg-white text-[#111418] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Username Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] text-sm font-medium">Tên đăng nhập</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#637588]">
                                        <span className="material-symbols-outlined text-[20px]">badge</span>
                                    </span>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#dbe0e6] bg-white text-[#111418] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="nguyenvana123"
                                        pattern="[a-z0-9_]+"
                                        title="Chỉ được dùng chữ thường, số và dấu gạch dưới"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] text-sm font-medium">Email</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#637588]">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#dbe0e6] bg-white text-[#111418] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] text-sm font-medium">Mật khẩu</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#637588]">
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full h-12 pl-11 pr-11 rounded-lg border border-[#dbe0e6] bg-white text-[#111418] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="Tối thiểu 6 ký tự"
                                        minLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#637588] hover:text-[#111418]"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] text-sm font-medium">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#637588]">
                                        <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                                    </span>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full h-12 pl-11 pr-11 rounded-lg border border-[#dbe0e6] bg-white text-[#111418] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#637588] hover:text-[#111418]"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showConfirmPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                                />
                                <label htmlFor="terms" className="text-sm text-[#3f4d5a] leading-snug">
                                    Tôi đồng ý với <a href="#" className="text-primary hover:underline font-medium">Điều khoản sử dụng</a> và <a href="#" className="text-primary hover:underline font-medium">Chính sách bảo mật</a> của TinTức24h.
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative py-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Hoặc đăng ký bằng</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 h-11 px-4 rounded-lg border border-[#dbe0e6] bg-white hover:bg-gray-50 transition-colors">
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                <span className="text-sm font-medium text-[#111418]">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 h-11 px-4 rounded-lg border border-[#dbe0e6] bg-white hover:bg-gray-50 transition-colors">
                                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                </svg>
                                <span className="text-sm font-medium text-[#111418]">Facebook</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer Link */}
                    <div className="bg-gray-50 p-6 text-center border-t border-[#e5e7eb]">
                        <p className="text-sm text-[#637588]">
                            Đã có tài khoản?
                            <Link to="/login" className="text-primary hover:text-blue-600 font-semibold ml-1">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
