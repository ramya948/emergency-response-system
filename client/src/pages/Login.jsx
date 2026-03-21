import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ShieldCheck, Mail, Lock, Loader } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(form.email, form.password);
            toast.success('Login successful!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <ShieldCheck size={48} className="auth-icon" />
                    <h1>Emergency Response</h1>
                    <p>Login to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group icon-input">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group icon-input">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                        {loading ? <><Loader size={18} className="spin" /> Authenticating...</> : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup">Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
