import {Outlet} from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop/index.jsx";

function MainPage() {
    return (
        <div style={{backgroundColor: "white"}}>
            <ScrollToTop/>
            <Outlet/>

        </div>
    );
}

export default MainPage;