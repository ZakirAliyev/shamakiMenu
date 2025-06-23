import './index.scss';
import React, { useState, useCallback, useEffect } from "react";
import {
    Table,
    Button,
    Popconfirm,
    Modal,
    Form,
    Input,
    Row,
    Col,
    Select,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import {
    usePostCategorysMutation,
    usePutCategorysMutation,
    useDeleteCategorysMutation,
    useGetAllCategoryQuery,
    usePutCategorysOrderMutation,
} from "/src/services/userApi.jsx";
import { CATEGORY_IMAGES } from "/src/contants.js";
import icon1 from "/src/assets/icons/icon.png";
import icon2 from "/src/assets/icons/2.png";
import icon3 from "/src/assets/icons/3.png";
import icon4 from "/src/assets/icons/4.png";
import icon5 from "/src/assets/icons/5.png";
import icon6 from "/src/assets/icons/6.png";
import icon7 from "/src/assets/icons/7.png";
import icon8 from "/src/assets/icons/8.png";
import icon9 from "/src/assets/icons/9.png";
import icon10 from "/src/assets/icons/10.png";
import icon11 from "/src/assets/icons/11.png";
import icon12 from "/src/assets/icons/12.png";
import icon13 from "/src/assets/icons/12.png";
import icon14 from "/src/assets/icons/13.png";
import icon15 from "/src/assets/icons/14.png";
import icon16 from "/src/assets/icons/15.png";
import icon17 from "/src/assets/icons/16.png";
import icon18 from "/src/assets/icons/17.png";
import icon19 from "/src/assets/icons/18.png";
import icon20 from "/src/assets/icons/19.png";
import icon21 from "/src/assets/icons/20.png";
import icon22 from "/src/assets/icons/21.png";
import icon23 from "/src/assets/icons/22.png";
import icon24 from "/src/assets/icons/23.png";
import icon25 from "/src/assets/icons/24.png";
import icon26 from "/src/assets/icons/25.png";
import icon27 from "/src/assets/icons/269.png";
import showToast from "../../../components/ToastMessage.js";
import { useNavigate } from "react-router-dom";
import { useDrag, useDrop } from 'react-dnd';
import update from 'immutability-helper';

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
    { name: "27.png", src: icon27 },
];

// Item type for react-dnd
const ItemTypes = {
    ROW: 'row',
};

// DraggableRow component
const DraggableRow = ({ index, moveRow, className, style, ...restProps }) => {
    const ref = React.useRef();
    const [{ isOver, dropClassName }, drop] = useDrop({
        accept: ItemTypes.ROW,
        collect: (monitor) => {
            const { index: dragIndex } = monitor.getItem() || {};
            if (dragIndex === index) {
                return {};
            }
            return {
                isOver: monitor.isOver(),
                dropClassName: dragIndex < index ? 'drop-over-downward' : 'drop-over-upward',
            };
        },
        drop: (item) => {
            moveRow(item.index, index);
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.ROW,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    drop(drag(ref));

    return (
        <tr
            ref={ref}
            className={`${className} ${isOver ? dropClassName : ''}`}
            style={{ cursor: 'move', ...style, opacity: isDragging ? 0.5 : 1 }}
            {...restProps}
        />
    );
};

// Helper function to convert image URL to File object
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

const CategoryTable = () => {
    const { data: getAllCategory, refetch: refetchCategories } = useGetAllCategoryQuery();
    const [categories, setCategories] = useState([]);
    const [postCategory, { isLoading: isPosting }] = usePostCategorysMutation();
    const [putCategory, { isLoading: isPutting }] = usePutCategorysMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategorysMutation();
    const [putCategorysOrder, { isLoading: isOrdering }] = usePutCategorysOrderMutation();
    const navigate = useNavigate();

    // Add Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [addForm] = Form.useForm();

    // Edit Modal state
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();
    const [editingRecord, setEditingRecord] = useState(null);

    // Update categories only if data has changed
    useEffect(() => {
        if (getAllCategory?.data) {
            if (JSON.stringify(categories) !== JSON.stringify(getAllCategory.data)) {
                setCategories(getAllCategory.data);
            }
        }
    }, [getAllCategory]);

    // Handle reordering
    const handleReOrder = useCallback(async (updatedCategories) => {
        try {
            const orderPayload = updatedCategories.map((category, index) => ({
                id: category.id,
                orderId: index.toString(),
            }));

            await putCategorysOrder(orderPayload).unwrap();
            showToast("Kateqoriya sırası uğurla yeniləndi!", "success");
        } catch (error) {
            console.error("Order Update Error:", error);
            const errorMsg = error?.data?.error || "Sıra yenilənərkən xəta baş verdi!";
            showToast(errorMsg, "error");
        }
    }, [putCategorysOrder]);

    // Move row for drag-and-drop
    const moveRow = useCallback(
        (dragIndex, hoverIndex) => {
            const dragRow = categories[dragIndex];
            const newCategories = update(categories, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragRow],
                ],
            });

            setCategories(newCategories);
            // Debounce the handleReOrder call
            const timeout = setTimeout(() => {
                handleReOrder(newCategories);
            }, 300);

            return () => clearTimeout(timeout);
        },
        [categories, handleReOrder]
    );

    // Handle view details
    const handleViewDetails = (record) => {
        navigate(`/admin/categories/${record.id}`);
    };

    // Table columns
    const columns = [
        {
            title: "#",
            key: "index",
            render: (text, record, index) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: 8, cursor: "grab" }}>::</span>
                    {index + 1}
                </div>
            ),
        },
        {
            title: "Şəkil",
            dataIndex: "categoryImage",
            key: "categoryImage",
            render: (categoryImage) => (
                <img
                    src={CATEGORY_IMAGES + categoryImage}
                    alt="Card"
                    style={{ width: 80, height: 80, objectFit: "cover" }}
                    onError={(e) => {
                        e.target.src = "/src/assets/icons/placeholder.png";
                    }}
                />
            ),
        },
        {
            title: "Kateqoriya Adı (AZ)",
            dataIndex: "name",
            key: "name",
            render: (name, record) => <strong>{name}</strong>,
        },
        {
            title: "Fəaliyyətlər",
            key: "actions",
            render: (text, record) => (
                <>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                        style={{ marginRight: 8 }}
                        disabled={isDeleting}
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        style={{ marginRight: 8 }}
                        disabled={isDeleting}
                    />
                    <Popconfirm
                        title="Bu kateqoriyanı siləcəyinizə əminsiniz?"
                        onConfirm={() => handleDelete(record)}
                        okText="Bəli"
                        cancelText="Xeyr"
                        disabled={isDeleting}
                    >
                        <Button icon={<DeleteOutlined />} danger disabled={isDeleting} />
                    </Popconfirm>
                </>
            ),
        },
    ];

    // Expanded row render
    const expandedRowRender = (record) => {
        return (
            <div>
                {record.nameEng && record.nameEng !== record.name && (
                    <p>
                        <strong>Ad (EN):</strong> {record.nameEng}
                    </p>
                )}
                {record.nameRu && record.nameRu !== record.name && (
                    <p>
                        <strong>Ad (RU):</strong> {record.nameRu}
                    </p>
                )}
            </div>
        );
    };

    // Delete operation
    const handleDelete = async (record) => {
        try {
            await deleteCategory(record.id).unwrap();
            showToast("Kateqoriya uğurla silindi!", "success");
            refetchCategories();
        } catch (error) {
            console.error("Delete Error:", error);
            const errorMsg = error?.data?.error || "Kateqoriya silinərkən xəta baş verdi!";
            showToast(errorMsg, "error");
        }
    };

    // Edit button click
    const handleEdit = (record) => {
        setEditingRecord(record);
        editForm.setFieldsValue({
            name: record.name,
            nameEng: record.nameEng,
            nameRu: record.nameRu,
            categoryImage: record.categoryImage,
            parentCategoryId: record.parentCategoryId || null,
        });
        setIsEditModalVisible(true);
    };

    // Add Modal open
    const showModal = () => {
        setIsModalVisible(true);
    };

    // Add Modal cancel
    const handleCancel = () => {
        setIsModalVisible(false);
        addForm.resetFields();
    };

    // Add Category POST operation
    const handlePost = async () => {
        try {
            const values = await addForm.validateFields();
            const formData = new FormData();
            const textFields = ["name", "nameEng", "nameRu", "parentCategoryId"];
            textFields.forEach((field) => {
                if (values[field]) {
                    formData.append(field, values[field]);
                }
            });
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

    // Edit Modal cancel
    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        editForm.resetFields();
        setEditingRecord(null);
    };

    // Edit Category PUT operation
    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validateFields();
            const formData = new FormData();
            const textFields = ["name", "nameEng", "nameRu", "parentCategoryId"];
            textFields.forEach((field) => {
                if (values[field]) {
                    formData.append(field, values[field]);
                }
            });
            if (editingRecord?.id) {
                formData.append("id", editingRecord.id);
            }
            if (values.categoryImage) {
                const imgObj = availableImages.find((item) => item.name === values.categoryImage);
                if (imgObj) {
                    const file = await convertImageToFile(imgObj.src, imgObj.name);
                    formData.append("categoryImage", file);
                } else {
                    throw new Error("Selected image not found");
                }
            }
            await putCategory(formData).unwrap();
            showToast("Kateqoriya uğurla yeniləndi!", "success");
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditingRecord(null);
            refetchCategories();
        } catch (error) {
            console.error("PUT Error:", error);
            const errorMsg = error.message || error?.data?.error || "Kateqoriya yenilənərkən xəta baş verdi!";
            showToast(errorMsg, "error");
        }
    };

    // Table components for react-dnd
    const components = {
        body: {
            row: DraggableRow,
        },
    };

    return (
        <div>
            <div style={{ marginBottom: "16px" }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    loading={isPosting}
                    disabled={isPosting}
                >
                    Yeni Ana Kateqoriya Əlavə edin
                </Button>
            </div>

            <Table
                rowKey={(record) => record.id.toString()}
                columns={columns}
                dataSource={categories}
                expandedRowRender={expandedRowRender}
                components={components}
                onRow={(record, index) => ({
                    index,
                    moveRow,
                })}
                scroll={{ y: '72vh' }}
                pagination={false}
            />

            <Modal
                title="Yeni Kateqoriya Əlavə edin"
                visible={isModalVisible}
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
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Kart Şəkli"
                                name="categoryImage"
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

            <Modal
                title="Kateqoriya Redaktə Et"
                visible={isEditModalVisible}
                onOk={handleEditSubmit}
                onCancel={handleEditCancel}
                cancelText="Ləğv et"
                okText="Yenilə"
                width={800}
                okButtonProps={{ loading: isPutting, disabled: isPutting }}
            >
                <Form form={editForm} layout="vertical">
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
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Kart Şəkli"
                                name="categoryImage"
                            >
                                <ImagePickerGallery
                                    onChange={(value) => editForm.setFieldsValue({ categoryImage: value })}
                                    value={editForm.getFieldValue("categoryImage")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryTable;