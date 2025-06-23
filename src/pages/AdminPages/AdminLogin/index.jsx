import  { useState } from 'react';
import Cookies from 'js-cookie';
import './index.scss';
import banner from '/src/assets/Group 47.png';
import {useNavigate} from "react-router-dom";
import {usePostAdminLoginMutation} from "../../../services/userApi.jsx";
import showToast from "../../../components/ToastMessage.js";

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [postAdminLogin] = usePostAdminLoginMutation();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await postAdminLogin({ email, password }).unwrap();
            showToast("Giriş uğurlu oldu !","success")
            setTimeout(navigate("/admin/category"), 2000);
            if (response?.statusCode === 200) {
                const token = response?.data?.token;
                console.log(response?.data?.token)
                const expireDate = new Date(response.data.expireDate);
                Cookies.set('natavanToken', token, {
                    expires: 1,
                });
            } else {
                Cookies.set('natavanToken', 'null');
            }
        } catch  {
            alert('Giriş zamanı xəta baş verdi:');
        }
    };

    return (
        <div className="login-panel">
            <img src={banner} alt="" className="login-banner" />
            <div className="login-form">
                <div className="title">
                    <h1>Daxil ol</h1>
                    <p>Admin panelə giriş</p>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Emailinizi daxil edin"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Şifrə</label>
                        <input
                            type="password"
                            placeholder="Şifrənizi daxil edin"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">Daxil ol</button>
                </form>
            </div>

            <img src={"back"} alt="" className="login-plane" />
        </div>
    );
}

export default AdminLogin;