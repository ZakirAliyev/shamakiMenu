import './index.scss';
import logo from '../../../assets/LogoNatavan.png';
import icon from '/src/assets/BAck.png';
import icon2 from '/src/assets/back2.png';
import CategoryCard from '../../../components/UserComponents/CategoryCard/index.jsx';
import { useNavigate } from 'react-router-dom';
import { useGetAllCategoryQuery } from '../../../services/userApi.jsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function CategoryPage() {
    const { data: getAllCategory } = useGetAllCategoryQuery();
    const { t } = useTranslation(); // For potential static text translation
    const navigate = useNavigate();
    const [language, setLanguage] = useState('az'); // Default to 'az'

    // Read language from localStorage on mount
    useEffect(() => {
        const storedLanguage = localStorage.getItem('natavanLang') || 'az';
        setLanguage(storedLanguage);
    }, []);

    // Function to get the correct field based on language
    const getLocalizedField = (item, field) => {
        if (!item) return '';
        if (language === 'en') return item[`${field}Eng`] || item[field];
        if (language === 'ru') return item[`${field}Ru`] || item[field];
        return item[field]; // Default to 'az'
    };

    // Map categories to include localized names
    const localizedCategories = getAllCategory?.data?.map(category => ({
        ...category,
        name: getLocalizedField(category, 'name'),
    }));

    return (
        <div id={'category-page'}>
            <div className={'container'}>
                <div className={'category-page'}>
                    <div className='icon'>
                        <img src={logo} alt='Natavan Logo' />
                    </div>
                    <div className={'back'} onClick={() => navigate('/')}>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='32'
                            height='32'
                            viewBox='0 0 32 32'
                            fill='none'
                            className={"back-icon"}
                        >
                            <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M28.0018 15.6679C28.0018 15.4027 27.8964 15.1484 27.7089 14.9608C27.5214 14.7733 27.267 14.6679 27.0018 14.6679H3.41579L9.70979 8.37593C9.80276 8.28295 9.87652 8.17257 9.92683 8.05109C9.97715 7.92962 10.003 7.79941 10.003 7.66793C10.003 7.53644 9.97715 7.40624 9.92683 7.28476C9.87652 7.16328 9.80276 7.0529 9.70979 6.95993C9.61681 6.86695 9.50643 6.7932 9.38495 6.74288C9.26348 6.69256 9.13327 6.66666 9.00179 6.66666C8.8703 6.66666 8.7401 6.69256 8.61862 6.74288C8.49714 6.7932 8.38676 6.86695 8.29379 6.95993L0.293788 14.9599C0.200661 15.0528 0.126775 15.1632 0.0763625 15.2847C0.0259496 15.4062 0 15.5364 0 15.6679C0 15.7995 0.0259496 15.9297 0.0763625 16.0512C0.126775 16.1727 0.200661 16.283 0.293788 16.3759L8.29379 24.3759C8.38676 24.4689 8.49714 24.5427 8.61862 24.593C8.7401 24.6433 8.8703 24.6692 9.00179 24.6692C9.13327 24.6692 9.26348 24.6433 9.38495 24.593C9.50643 24.5427 9.61681 24.4689 9.70979 24.3759C9.80276 24.283 9.87652 24.1726 9.92683 24.0511C9.97715 23.9296 10.003 23.7994 10.003 23.6679C10.003 23.5364 9.97715 23.4062 9.92683 23.2848C9.87652 23.1633 9.80276 23.0529 9.70979 22.9599L3.41579 16.6679H27.0018C27.267 16.6679 27.5214 16.5626 27.7089 16.375C27.8964 16.1875 28.0018 15.9331 28.0018 15.6679Z'
                                fill='#F5F5EB'
                            />
                        </svg>
                    </div>
                    <div className={'row'}>
                        {localizedCategories?.map((item, index) => (
                            <CategoryCard key={index} item={item} />
                        ))}
                    </div>
                </div>
            </div>
            <div className={'buta'}>
                <img src={icon} alt='Natavan Logo' />
            </div>
            <div style={{ textAlign: 'center', marginTop: '82px', position: 'relative' }}>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='338'
                    height='6'
                    viewBox='0 0 338 6'
                    fill='none'
                    className={"down-xett"}
                >
                    <path
                        d='M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM337.887 3L335 0.113249L332.113 3L335 5.88675L337.887 3ZM3 3V3.5H335V3V2.5H3V3Z'
                        fill='white'
                    />
                </svg>
                <div className={'buta2'}>
                    <img src={icon2} alt='Natavan Logo' />
                </div>
            </div>
        </div>
    );
}

export default CategoryPage;