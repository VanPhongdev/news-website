import { useState, useEffect } from 'react';
import { userAPI, categoryAPI, articleAPI, deletionRequestAPI } from '../../services/api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);
    const [deletionRequests, setDeletionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [roleFilter, setRoleFilter] = useState('all'); // Filter for users by role
    const [deletionStatusFilter, setDeletionStatusFilter] = useState('pending'); // Filter for deletion requests
    const [roleChangeModal, setRoleChangeModal] = useState({ show: false, userId: null, currentRole: '' });
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, categoriesRes, articlesRes, deletionRequestsRes] = await Promise.all([
                userAPI.getUsers(),
                categoryAPI.getCategories(),
                articleAPI.getArticles({ limit: 1000 }), // Get all articles for admin
                deletionRequestAPI.getAllRequests()
            ]);
            setUsers(usersRes.data.data);
            setCategories(categoriesRes.data.data);
            setArticles(articlesRes.data.data);
            setDeletionRequests(deletionRequestsRes.data.data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa user này?')) {
            try {
                await userAPI.deleteUser(id);
                setUsers(users.filter(u => u._id !== id));
                alert('Xóa user thành công');
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa user'));
            }
        }
    };

    const handleChangeRole = (id, currentRole) => {
        setRoleChangeModal({ show: true, userId: id, currentRole });
        setSelectedRole(currentRole);
    };

    const confirmRoleChange = async () => {
        const { userId } = roleChangeModal;
        try {
            await userAPI.updateUserRole(userId, selectedRole);
            setUsers(users.map(u => u._id === userId ? { ...u, role: selectedRole } : u));
            alert('Cập nhật role thành công');
            setRoleChangeModal({ show: false, userId: null, currentRole: '' });
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật role'));
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa chuyên mục này?')) {
            try {
                await categoryAPI.deleteCategory(id);
                setCategories(categories.filter(c => c._id !== id));
                alert('Xóa chuyên mục thành công');
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa chuyên mục'));
            }
        }
    };

    const handleDeleteArticle = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
            try {
                await articleAPI.deleteArticle(id);
                setArticles(articles.filter(a => a._id !== id));
                alert('Xóa bài viết thành công');
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa bài viết'));
            }
        }
    };

    const handleApproveDeletion = async (id) => {
        if (window.confirm('Đồng ý xóa bài viết này? Hành động không thể hoàn tác!')) {
            try {
                await deletionRequestAPI.approveRequest(id);
                alert('Đã phê duyệt và xóa bài viết');
                fetchData(); // Refresh all data
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể phê duyệt'));
            }
        }
    };

    const handleRejectDeletion = async (id) => {
        if (window.confirm('Từ chối yêu cầu xóa bài viết này?')) {
            try {
                await deletionRequestAPI.rejectRequest(id);
                alert('Đã từ chối yêu cầu xóa');
                fetchData(); // Refresh all data
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể từ chối'));
            }
        }
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="container dashboard">
            <h2>Admin Dashboard</h2>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Quản lý Users ({users.length})
                </button>
                <button
                    className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('categories')}
                >
                    Quản lý Chuyên mục ({categories.length})
                </button>
                <button
                    className={`btn ${activeTab === 'articles' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('articles')}
                >
                    Quản lý Bài viết ({articles.length})
                </button>
                <button
                    className={`btn ${activeTab === 'deletionRequests' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('deletionRequests')}
                >
                    Yêu cầu xóa bài ({deletionRequests.filter(r => r.status === 'pending').length})
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="table-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Danh sách Users</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ fontWeight: '500' }}>Lọc theo role:</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '5px', border: '2px solid #e0e0e0' }}
                            >
                                <option value="all">Tất cả ({users.length})</option>
                                <option value="admin">Admin ({users.filter(u => u.role === 'admin').length})</option>
                                <option value="editor">Editor ({users.filter(u => u.role === 'editor').length})</option>
                                <option value="author">Author ({users.filter(u => u.role === 'author').length})</option>
                                <option value="reader">Reader ({users.filter(u => u.role === 'reader').length})</option>
                            </select>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users
                                .filter(user => roleFilter === 'all' || user.role === roleFilter)
                                .map(user => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td><span className={`status-badge status-${user.role}`}>{user.role}</span></td>
                                        <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning"
                                                style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}
                                                onClick={() => handleChangeRole(user._id, user.role)}
                                            >
                                                Đổi role
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '0.25rem 0.75rem' }}
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="table-container">
                    <h3>Danh sách Chuyên mục</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Slug</th>
                                <th>Mô tả</th>
                                <th>Người tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>{category.slug}</td>
                                    <td>{category.description}</td>
                                    <td>{category.createdBy?.username}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '0.25rem 0.75rem' }}
                                            onClick={() => handleDeleteCategory(category._id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'articles' && (
                <div className="table-container">
                    <h3>Danh sách Bài viết</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Tác giả</th>
                                <th>Chuyên mục</th>
                                <th>Trạng thái</th>
                                <th>Lượt xem</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article._id}>
                                    <td>{article.title}</td>
                                    <td>{article.author?.username}</td>
                                    <td>{article.category?.name}</td>
                                    <td><span className={`status-badge status-${article.status}`}>{article.status}</span></td>
                                    <td>{article.views}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '0.25rem 0.75rem' }}
                                            onClick={() => handleDeleteArticle(article._id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'deletionRequests' && (
                <div className="table-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Yêu cầu xóa bài viết</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ fontWeight: '500' }}>Lọc theo trạng thái:</label>
                            <select
                                value={deletionStatusFilter}
                                onChange={(e) => setDeletionStatusFilter(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '5px', border: '2px solid #e0e0e0' }}
                            >
                                <option value="all">Tất cả ({deletionRequests.length})</option>
                                <option value="pending">Chờ duyệt ({deletionRequests.filter(r => r.status === 'pending').length})</option>
                                <option value="approved">Đã duyệt ({deletionRequests.filter(r => r.status === 'approved').length})</option>
                                <option value="rejected">Đã từ chối ({deletionRequests.filter(r => r.status === 'rejected').length})</option>
                            </select>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Bài viết</th>
                                <th>Tác giả</th>
                                <th>Lý do</th>
                                <th>Ngày yêu cầu</th>
                                <th>Trạng thái</th>
                                <th>Người xét duyệt</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deletionRequests
                                .filter(req => deletionStatusFilter === 'all' || req.status === deletionStatusFilter)
                                .map(request => (
                                    <tr key={request._id}>
                                        <td>{request.article?.title || '[Đã xóa]'}</td>
                                        <td>{request.author?.username}</td>
                                        <td style={{ maxWidth: '300px' }}>{request.reason}</td>
                                        <td>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td><span className={`status-badge status-${request.status}`}>{request.status}</span></td>
                                        <td>
                                            {request.reviewedBy?.username || '-'}
                                            {request.reviewedAt && <><br /><small>{new Date(request.reviewedAt).toLocaleDateString('vi-VN')}</small></>}
                                        </td>
                                        <td>
                                            {request.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn btn-success"
                                                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}
                                                        onClick={() => handleApproveDeletion(request._id)}
                                                    >
                                                        ✓ Duyệt
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ padding: '0.25rem 0.75rem' }}
                                                        onClick={() => handleRejectDeletion(request._id)}
                                                    >
                                                        ✗ Từ chối
                                                    </button>
                                                </>
                                            )}
                                            {request.status !== 'pending' && <span>-</span>}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Role Change Modal */}
            {roleChangeModal.show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '10px',
                        minWidth: '400px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Thay đổi vai trò</h3>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Chọn vai trò mới:
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '5px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="reader">Reader (Độc giả)</option>
                                <option value="author">Author (Tác giả)</option>
                                <option value="editor">Editor (Biên tập viên)</option>
                                <option value="admin">Admin (Quản trị viên)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setRoleChangeModal({ show: false, userId: null, currentRole: '' })}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={confirmRoleChange}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
