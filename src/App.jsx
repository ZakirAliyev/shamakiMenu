import './App.css'
import {createBrowserRouter} from "react-router";
import {RouterProvider} from "react-router-dom";
import ROUTES from "./routes/ROUTES.jsx";
import {ToastContainer} from "react-toastify";
import Cookies from "js-cookie";
import {useEffect} from "react";
import {useTranslation} from "react-i18next";

function App() {
    const token = Cookies.get("natavanToken");

    if (!token) {
        Cookies.set("natavanToken", "null");
    }


    const routes = createBrowserRouter(ROUTES);
    const { i18n } = useTranslation();

    useEffect(() => {
        // RTL/LTR ve dil ayarı
        document.documentElement.setAttribute('dir', i18n.language === 'arb' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', i18n.language === 'arb' ? 'ar' : i18n.language);

        // CSS dosyasını dinamik olarak değiştir (isteğe bağlı)
        const styleLink = document.getElementById('app-style') || document.createElement('link');
        styleLink.id = 'app-style';
        styleLink.rel = 'stylesheet';
        styleLink.href = i18n.language === 'arb' ? '/rtl.css' : '/ltr.css';
        document.head.appendChild(styleLink);
    }, [i18n.language]);
    return (
        <>
            <ToastContainer/>
            <RouterProvider router={routes}/>
            {/*<div className={"container"}>*/}
            {/*    <div className="row">*/}
            {/*        <ServicesCard/>*/}
            {/*        <ServicesCard/>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </>
    )
}

export default App