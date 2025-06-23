import "./index.scss";
import logo from "/src/assets/LogoNatavan.png";
import i18n from "i18next";
import {useNavigate} from "react-router-dom"; // Import i18n instance

function LoadingPage() {
    // Function to handle language change
    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang); // Change language using i18next
        localStorage.setItem("natavanLang", lang); // Store selected language in localStorage
    };
    const navigate= useNavigate();
    return (
        <div id="loading-page">
            <div className="overlay"></div>
            <div className="container">
                <div className="loading-page">
                    <div className="icon">
                        <img src={logo} alt="Natavan Logo" />
                    </div>
                    <div className="language">
                        <div onClick={() => {
                            handleLanguageChange("az");
                            navigate("/category");
                        }}>Azərbaycan dili</div>
                        <div onClick={() => {
                            handleLanguageChange("en");
                            navigate("/category");
                        }}>English</div>
                        <div onClick={() => {
                            handleLanguageChange("ru");
                            navigate("/category");
                        }}>Русский язык</div>
                    </div>
                    <div className="contact">
                        <div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                            >
                                <path
                                    d="M17.6275 13.9883L15.2991 13.7225C15.0254 13.6903 14.7479 13.7206 14.4875 13.8111C14.2271 13.9016 13.9906 14.05 13.7958 14.245L12.1091 15.9317C9.50709 14.6079 7.39203 12.4929 6.06831 9.89082L7.76414 8.19499C8.15831 7.80082 8.35081 7.25082 8.28664 6.69166L8.02081 4.38166C7.96903 3.93441 7.75449 3.52185 7.41807 3.22262C7.08165 2.92339 6.64688 2.75842 6.19664 2.75916H4.61081C3.57498 2.75916 2.71331 3.62082 2.77748 4.65666C3.26331 12.485 9.52414 18.7367 17.3433 19.2225C18.3791 19.2867 19.2408 18.425 19.2408 17.3892V15.8033C19.25 14.8775 18.5533 14.0983 17.6275 13.9883Z"
                                    fill="white"
                                />
                            </svg>
                            +994 (55) 817 00 56
                        </div>
                        <p>
                            Pirqulu kəndi, Şamaxı rayonu<br />
                            AZ5626
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingPage;