import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
    const token = Cookies.get('natavanToken');
    if (!token || token === 'null') {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
