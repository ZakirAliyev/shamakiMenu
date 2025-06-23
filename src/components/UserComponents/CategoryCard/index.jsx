import './index.scss'
import icon from "/src/assets/icons/icon.png"
import {useNavigate} from "react-router-dom";
import {CATEGORY_IMAGES} from "../../../contants.js";
function CategoryCard({item}) {
    const navigate = useNavigate();
    return (
        <div className={"col-10-60 col-md-15-60 col-sm-20-60 col-xs-20-60"} onClick={()=>navigate(`/menu/${item?.id}`)}>
            <div id={"category-card"}>
                <div className={"card-icon"}>
                    <img src={CATEGORY_IMAGES + item?.categoryImage}/>
                </div>
                <p>{item?.name}</p>
            </div>
        </div>
    );
}

export default CategoryCard;