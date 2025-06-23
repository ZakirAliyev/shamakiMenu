import './index.scss'
import logo from "../../../assets/LogoNatavan.png"
import { NavLink, useLocation } from "react-router-dom";
import {TbLogs} from "react-icons/tb";
import {FaClinicMedical} from "react-icons/fa";
import {IoFastFoodOutline} from "react-icons/io5";

function AdminLeftBar() {
    const location = useLocation();

    return (
        <section id="adminLeftBar">
            <img src={logo} alt="logo" />
            <li className={location.pathname === "/admin/category" ? "selected" : ""}>
                <TbLogs className="icon" />
                <NavLink to="/admin/category">
                    Kateqoriya
                </NavLink>
            </li>
            <li className={location.pathname === "/admin/food" ? "selected" : ""}>
                <IoFastFoodOutline className="icon" />
                <NavLink to="/admin/food">
                    Yemekler
                </NavLink>
            </li>


        </section>
    );
}

export default AdminLeftBar;
