import AdminCategoryDetailTable from "./Table.jsx";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom"; // Import useLocation
import SubCategoryTable from "./Table2.jsx";
import { useGetCategorysByIdQuery, usePostCategorysMutation } from "../../../services/userApi.jsx";
import { Button, Col, Form, Input, Modal, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import showToast from "../../../components/ToastMessage.js";
import icon1 from "../../../assets/icons/icon.png";
import icon2 from "../../../assets/icons/2.png";
import icon3 from "../../../assets/icons/3.png";
import icon4 from "../../../assets/icons/4.png";
import icon5 from "../../../assets/icons/5.png";
import icon6 from "../../../assets/icons/6.png";
import icon7 from "../../../assets/icons/7.png";
import icon8 from "../../../assets/icons/8.png";
import icon9 from "../../../assets/icons/9.png";
import icon10 from "../../../assets/icons/10.png";
import icon11 from "../../../assets/icons/11.png";
import icon12 from "../../../assets/icons/12.png";
import icon13 from "../../../assets/icons/13.png"; // Fixed: Corrected from "12.png"
import icon14 from "../../../assets/icons/14.png";
import icon15 from "../../../assets/icons/15.png";
import icon16 from "../../../assets/icons/16.png";
import icon17 from "../../../assets/icons/17.png";
import icon18 from "../../../assets/icons/18.png";
import icon19 from "../../../assets/icons/19.png";
import icon20 from "../../../assets/icons/20.png";
import icon21 from "../../../assets/icons/21.png";
import icon22 from "../../../assets/icons/22.png";
import icon23 from "../../../assets/icons/23.png";
import icon24 from "../../../assets/icons/24.png";
import icon25 from "../../../assets/icons/25.png";
import icon26 from "../../../assets/icons/269.png";

const availableImages = [
    { name: "1.png", src: icon1 },
    { name: "2.png", src: icon2 },
    { name: "3.png", src: icon3 },
    { name: "4.png", src: icon4 },
    { name: "5.png", src: icon5 },
    { name: "6.png", src: icon6 },
    { name: "7.png", src: icon7 },
    { name: "8.png", src: icon8 },
    { name: "9.png", src: icon9 },
    { name: "10.png", src: icon10 },
    { name: "11.png", src: icon11 },
    { name: "12.png", src: icon12 },
    { name: "13.png", src: icon13 },
    { name: "14.png", src: icon14 },
    { name: "15.png", src: icon15 },
    { name: "16.png", src: icon16 },
    { name: "17.png", src: icon17 },
    { name: "18.png", src: icon18 },
    { name: "19.png", src: icon19 },
    { name: "20.png", src: icon20 },
    { name: "21.png", src: icon21 },
    { name: "22.png", src: icon22 },
    { name: "23.png", src: icon23 },
    { name: "24.png", src: icon24 },
    { name: "25.png", src: icon25 },
    { name: "26.png", src: icon26 },
];

const convertImageToFile = async (imgSrc, fileName) => {
    try {
        const res = await fetch(imgSrc);
        if (!res.ok) throw new Error("Failed to fetch image");
        const blob = await res.blob();
        return new File([blob], fileName, { type: blob.type });
    } catch (error) {
        throw new Error(`Image conversion failed: ${error.message}`);
    }
};

// ImagePickerGallery component
const ImagePickerGallery = ({ value, onChange }) => {
    const handleClick = (imgName) => {
        onChange(imgName);
    };

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                maxHeight: "250px",
                overflowY: "auto",
                padding: "5px",
            }}
        >
            {availableImages.map((imgObj) => (
                <div
                    key={imgObj.name}
                    onClick={() => handleClick(imgObj.name)}
                    style={{
                        width: "100px",
                        height: "100px",
                        border: value === imgObj.name ? "2px solid #1890ff" : "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                    }}
                >
                    <img
                        src={imgObj.src}
                        alt={imgObj.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

function AdminCategoryDetail() {
    const { id } = useParams();
    const { data: getCategorysById, refetch: refetchCategories } = useGetCategorysByIdQuery(id);
    const [postCategory, { isLoading: isPosting }] = usePostCategorysMutation();
    const [addForm] = Form.useForm();
    const data = getCategorysById?.data?.subCategories || [];
    const [isModalVisible, setIsModalVisible] = useState(false);
    const location = useLocation()
    const showModal = () => {
        setIsModalVisible(true);
        addForm.setFieldsValue({ parentCategoryId: id });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        addForm.resetFields();
    };

    const handlePost = async () => {
        try {
            const values = await addForm.validateFields();
            const formData = new FormData();
            const textFields = ["name", "nameEng", "nameRu"];
            textFields.forEach((field) => {
                if (values[field]) {
                    formData.append(field, values[field]);
                }
            });
            formData.append("parentCategoryId", id);

            if (values.categoryImage) {
                const imgObj = availableImages.find((item) => item.name === values.categoryImage);
                if (imgObj) {
                    const file = await convertImageToFile(imgObj.src, imgObj.name);
                    formData.append("categoryImage", file);
                } else {
                    throw new Error("Selected image not found");
                }
            }

            await postCategory(formData).unwrap();
            showToast("Kateqoriya uğurla əlavə edildi!", "success");
            setIsModalVisible(false);
            addForm.resetFields();
            refetchCategories();
        } catch (error) {
            console.error("POST Error:", error);
            const errorMsg = error.message || error?.data?.error || "Kateqoriya əlavə edilərkən xəta baş verdi!";
            showToast(errorMsg, "error");
        }
    };
    const hideButtonPaths = `/admin/categories/${id}`;
    return (
        <div>
            {hideButtonPaths.includes(location.pathname) && ( // Conditionally render the button
                <div style={{ marginBottom: "16px" }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showModal}
                        loading={isPosting}
                        disabled={isPosting}
                    >
                        Yeni Alt Kateqoriya Əlavə edin
                    </Button>
                </div>
            )}
            {data.length === 0 ? null : <SubCategoryTable id={id} />}
            <AdminCategoryDetailTable id={id} />
            <Modal
                title="Yeni Kateqoriya Əlavə edin"
                open={isModalVisible}
                onOk={handlePost}
                onCancel={handleCancel}
                cancelText="Ləğv et"
                okText="Əlavə Et"
                width={800}
                okButtonProps={{ loading: isPosting, disabled: isPosting }}
            >
                <Form form={addForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Kateqoriya Adı (AZ)"
                                name="name"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Kateqoriya Adı (ENG)"
                                name="nameEng"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Kateqoriya Adı (RU)"
                                name="nameRu"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="parentCategoryId"
                                hidden
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Kart Şəkli"
                                name="categoryImage"
                                rules={[{ required: true, message: "Şəkil seçin!" }]}
                            >
                                <ImagePickerGallery
                                    onChange={(value) => addForm.setFieldsValue({ categoryImage: value })}
                                    value={addForm.getFieldValue("categoryImage")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}

export default AdminCategoryDetail;