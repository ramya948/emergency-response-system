import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ShieldCheck, User, Mail, Lock, Loader } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (form.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        try {
            setLoading(true);
            await register(form.name, form.email, form.password);
            toast.success('Registration successful!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <ShieldCheck size={48} className="auth-icon" />
                    <h1>Create Account</h1>
                    <p>Join the Emergency Response System</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group icon-input">
                        <User size={18} className="input-icon" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

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

                    <div className="form-group icon-input">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                        {loading ? <><Loader size={18} className="spin" /> Registering...</> : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
