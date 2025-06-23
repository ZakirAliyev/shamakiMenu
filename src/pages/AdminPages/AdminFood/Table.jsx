import { useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Popconfirm,
    Row,
    Col,
    Select,
    message,
    Tooltip,
    Upload,
    Image,
} from "antd";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { UploadOutlined, SearchOutlined } from "@ant-design/icons";
import {
    useDeleteProductsMutation,
    useGetAllCategoryQuery,
    useGetAllProductsQuery,
    usePostProductsMutation,
    usePutProductsMutation,
    useDeleteProductsImageMutation
} from "../../../services/userApi.jsx";
import { PRODUCT_IMAGES } from "../../../contants.js";

const FoodTable = () => {
    const { data: getAllProducts, refetch: refetchFoods } = useGetAllProductsQuery();
    const foods = getAllProducts?.data || [];
    const { data: getAllCategory } = useGetAllCategoryQuery();
    const categories = getAllCategory?.data || [];
    const [postFood, { isLoading: isAdding }] = usePostProductsMutation();
    const [putFood, { isLoading: isUpdating }] = usePutProductsMutation();
    const [deleteFood] = useDeleteProductsMutation();
    const [deleteProductImage] = useDeleteProductsImageMutation();
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [editingFood, setEditingFood] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [editFileList, setEditFileList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Helper function to generate category and subcategory options with OptGroup
    const getCategoryOptions = () => {
        return categories.map((category) => ({
            label: category.name,
            options: [
                {
                    value: category.id,
                    label: (
                        <Tooltip title={`Ana Kategori: ${category.name}`}>
                            <span className="font-semibold">{category.name}</span>
                        </Tooltip>
                    ),
                },
                ...(category.subCategories?.map((subCategory) => ({
                    value: subCategory.id,
                    label: (
                        <Tooltip title={`Alt Kategori: ${category.name} > ${subCategory.name}`}>
                            <span className="ml-4 italic">{subCategory.name}</span>
                        </Tooltip>
                    ),
                })) || []),
            ],
        }));
    };

    // Helper function to get category or subcategory name by ID
    const getCategoryName = (categoryId) => {
        for (const category of categories) {
            if (category.id === categoryId) {
                return category.name;
            }
            for (const subCategory of category.subCategories || []) {
                if (subCategory.id === categoryId) {
                    return `${category.name} > ${subCategory.name}`;
                }
            }
        }
        return "Bilinməyən Kateqoriya";
    };

    // Custom filter for Select search
    const filterOption = (input, option) => {
        const label = option?.label?.props?.children?.props?.children || option?.label || "";
        return label.toLowerCase().includes(input.toLowerCase());
    };

    // Image upload handler
    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList.slice(-1)); // Keep only the latest file
    };

    const handleEditUploadChange = ({ fileList }) => {
        setEditFileList(fileList.slice(-1)); // Keep only the latest file
    };

    // Modal handlers
    const showAddModal = () => {
        form.resetFields();
        setFileList([]);
        setIsAddModalVisible(true);
    };

    const showEditModal = (record) => {
        setEditingFood(record);
        editForm.setFieldsValue({
            name: record.name,
            nameEng: record.nameEng,
            nameRu: record.nameRu,
            description: record.description,
            descriptionEng: record.descriptionEng,
            descriptionRu: record.descriptionRu,
            price: record.price,
            categoryId: record.categoryId,
        });
        setEditFileList(
            record.productImage
                ? [{ uid: "-1", name: "image", status: "done", url: PRODUCT_IMAGES + record.productImage }]
                : []
        );
        setIsEditModalVisible(true);
    };

    const handleAddCancel = () => {
        setIsAddModalVisible(false);
        form.resetFields();
        setFileList([]);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        editForm.resetFields();
        setEditFileList([]);
        setEditingFood(null);
    };

    // Form submission handlers
    const handleAddFood = async (values) => {
        const { name, nameEng, nameRu, description, descriptionEng, descriptionRu, price, categoryId } = values;

        const payload = new FormData();
        payload.append("name", name);
        payload.append("nameEng", nameEng);
        payload.append("nameRu", nameRu);
        payload.append("description", description || "");
        payload.append("descriptionEng", descriptionEng || "");
        payload.append("descriptionRu", descriptionRu || "");
        payload.append("price", parseFloat(price));
        payload.append("categoryId", categoryId);
        if (fileList[0]?.originFileObj) {
            payload.append("productImage", fileList[0].originFileObj);
        }

        try {
            await postFood(payload).unwrap();
            message.success("Yemək uğurla əlavə edildi!");
            setIsAddModalVisible(false);
            form.resetFields();
            setFileList([]);
            refetchFoods();
        } catch (error) {
            console.error("Error adding food:", error);
            message.error(error?.data?.message || "Yemək əlavə edilərkən xəta baş verdi!");
        }
    };

    const handleEditFood = async (values) => {
        const { name, nameEng, nameRu, description, descriptionEng, descriptionRu, price, categoryId } = values;

        const payload = new FormData();
        payload.append("id", editingFood.id);
        payload.append("name", name);
        payload.append("nameEng", nameEng);
        payload.append("nameRu", nameRu);
        payload.append("description", description || "");
        payload.append("descriptionEng", descriptionEng || "");
        payload.append("descriptionRu", descriptionRu || "");
        payload.append("price", parseFloat(price));
        payload.append("categoryId", categoryId);
        if (editFileList[0]?.originFileObj) {
            payload.append("productImage", editFileList[0].originFileObj);
        }

        try {
            // Normal güncelleme işlemi
            await putFood(payload).unwrap();

            // Eğer editFileList boşsa, yani resim silinmişse, ikinci endpoint'e istek at
            if (editFileList.length === 0 && editingFood.productImage) {
                await deleteProductImage(editingFood.id).unwrap();
            }

            message.success("Yemək uğurla yeniləndi!");
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditFileList([]);
            setEditingFood(null);
            refetchFoods();
        } catch (error) {
            console.error("Error updating food:", error);
            message.error(error?.data?.message || "Yemək yenilənərkən xəta baş verdi!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteFood(id).unwrap();
            message.success("Yemək uğurla silindi!");
            refetchFoods();
        } catch (error) {
            console.error("Error deleting food:", error);
            message.error(error?.data?.message || "Yemək silinərkən xəta baş verdi!");
        }
    };

    // Filter foods based on search query
    const filteredFoods = foods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            render: (text, record, index) => <div>{index + 1}</div>,
        },
        {
            title: "Şəkil",
            dataIndex: "productImage",
            key: "productImage",
            render: (productImage) =>
                productImage ? (
                    <Image
                        src={PRODUCT_IMAGES + productImage}
                        alt="Food"
                        width={50}
                        height={50}
                        className="object-cover rounded"
                    />
                ) : (
                    "Şəkil yoxdur"
                ),
        },
        {
            title: "Ad",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Qiymət",
            dataIndex: "price",
            key: "price",
            render: (price) => `${price.toFixed(2)} AZN`,
        },
        {
            title: "Kateqoriya",
            dataIndex: "categoryId",
            key: "categoryId",
            render: (categoryId) => getCategoryName(categoryId),
        },
        {
            title: "Əməliyyatlar",
            key: "actions",
            render: (text, record) => (
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <Button type="primary" onClick={() => showEditModal(record)}>
                        <FaRegEdit />
                    </Button>
                    <Popconfirm
                        title="Silmək istədiyinizə əminsiniz?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Bəli"
                        cancelText="Xeyr"
                    >
                        <Button type="default" danger>
                            <MdDeleteForever />
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const expandedRowRender = (record) => {
        return (
            <div>
                <h4>Əlavə Məlumat</h4>
                <Row gutter={16}>
                    <Col span={12}>
                        <p>
                            <strong>Ad (EN):</strong> {record.nameEng || "Yoxdur"}
                        </p>
                        <p>
                            <strong>Ad (RU):</strong> {record.nameRu || "Yoxdur"}
                        </p>
                        <p>
                            <strong>Təsvir (AZ):</strong> {record.description || "Yoxdur"}
                        </p>
                    </Col>
                    <Col span={12}>
                        <p>
                            <strong>Təsvir (EN):</strong> {record.descriptionEng || "Yoxdur"}
                        </p>
                        <p>
                            <strong>Təsvir (RU):</strong> {record.descriptionRu || "Yoxdur"}
                        </p>
                        <p>
                            <strong>Kateqoriya:</strong> {getCategoryName(record.categoryId)}
                        </p>
                    </Col>
                </Row>
            </div>
        );
    };

    // Upload props for validation
    const uploadProps = {
        fileList,
        onChange: handleUploadChange,
        listType: "picture-card",
    };

    const editUploadProps = {
        fileList: editFileList,
        onChange: handleEditUploadChange,
        listType: "picture-card",
    };

    return (
        <div className="p-4">
            <div style={{ marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
                <Input
                    placeholder="Yemək adına görə axtar"
                    prefix={<SearchOutlined />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: 300, borderRadius: "6px" }}
                />
                <Button
                    type="primary"
                    onClick={showAddModal}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    +
                </Button>
            </div>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredFoods}
                pagination={{ pageSize: 5 }}
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) =>
                        !!record.nameEng ||
                        !!record.nameRu ||
                        !!record.description ||
                        !!record.descriptionEng ||
                        !!record.descriptionRu ||
                        !!record.productImage,
                }}
            />

            {/* Add Food Modal */}
            <Modal
                title="Yeni Yemək Əlavə Et"
                open={isAddModalVisible}
                onCancel={handleAddCancel}
                footer={null}
                width={800}
                className="rounded-lg"
            >
                <Form form={form} layout="vertical" onFinish={handleAddFood}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Yemək Adı (AZ)"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input placeholder="Ad daxil edin" className="rounded-md" />
                            </Form.Item>
                            <Form.Item
                                name="nameEng"
                                label="Yemək Adı (EN)"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input placeholder="Ad daxil edin (EN)" className="rounded-md" />
                            </Form.Item>
                            <Form.Item
                                name="nameRu"
                                label="Yemək Adı (RU)"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input placeholder="Ad daxil edin (RU)" className="rounded-md" />
                            </Form.Item>
                            <Form.Item
                                name="price"
                                label="Qiymət"
                                rules={[
                                    { required: true, message: "Qiymət daxil edin!" },
                                    {
                                        validator: (_, value) =>
                                            value >= 0
                                                ? Promise.resolve()
                                                : Promise.reject("Qiymət 0-dan kiçik ola bilməz!"),
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="Qiymət daxil edin"
                                    className="rounded-md"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="description" label="Təsvir (AZ)">
                                <Input.TextArea
                                    placeholder="Təsvir daxil edin"
                                    className="rounded-md"
                                    rows={4}
                                />
                            </Form.Item>
                            <Form.Item name="descriptionEng" label="Təsvir (EN)">
                                <Input.TextArea
                                    placeholder="Təsvir daxil edin (EN)"
                                    className="rounded-md"
                                    rows={4}
                                />
                            </Form.Item>
                            <Form.Item name="descriptionRu" label="Təsvir (RU)">
                                <Input.TextArea
                                    placeholder="Təsvir daxil edin (RU)"
                                    className="rounded-md"
                                    rows={4}
                                />
                            </Form.Item>
                            <Form.Item
                                name="categoryId"
                                label="Kateqoriya"
                                rules={[{ required: true, message: "Kateqoriya seçin!" }]}
                            >
                                <Select
                                    placeholder="Kateqoriya seçin"
                                    className="rounded-md"
                                    showSearch
                                    filterOption={filterOption}
                                    options={getCategoryOptions()}
                                />
                            </Form.Item>
                            <Form.Item
                                name="productImage"
                                label="Şəkil"
                            >
                                <Upload {...uploadProps} maxCount={1}>
                                    <div>
                                        <UploadOutlined />
                                        <div>Şəkil Yüklə</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item className="text-right">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="mr-2 bg-blue-500 hover:bg-blue-600 rounded-md"
                            loading={isAdding}
                            disabled={isAdding}
                        >
                            Əlavə Et
                        </Button>
                        <Button onClick={handleAddCancel} className="rounded-md">
                            İmtina Et
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Food Modal */}
            <Modal
                title="Yemək Redaktə Et"
                open={isEditModalVisible}
                onCancel={handleEditCancel}
                footer={null}
                width={800}
                className="rounded-lg"
            >
                <Form form={editForm} layout="vertical" onFinish={handleEditFood}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Yemək Adı (AZ)"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input placeholder="Ad daxil edin" className="rounded-md" />
                            </Form.Item>
                            <Form.Item
                                name="nameEng"
                                label="Yemək Adı (EN)"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input placeholder="Ad daxil edin (EN)" className="rounded-md" />
                            </Form.Item>
                            <Form.Item
                                name="nameRu"
                                label="Yemək Adı (RU)"
                                rules={[{ required: true, message: "Ad daxil edin!" }]}
                            >
                                <Input placeholder="Ad daxil edin (RU)" className="rounded-md" />
                            </Form.Item>
                            <Form.Item
                                name="price"
                                label="Qiymət"
                                rules={[
                                    { required: true, message: "Qiymət daxil edin!" },
                                    {
                                        validator: (_, value) =>
                                            value >= 0
                                                ? Promise.resolve()
                                                : Promise.reject("Qiymət 0-dan kiçik ola bilməz!"),
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="Qiymət daxil edin"
                                    className="rounded-md"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="description" label="Təsvir (AZ)">
                                <Input.TextArea
                                    placeholder="Təsvir daxil edin"
                                    className="rounded-md"
                                    rows={4}
                                />
                            </Form.Item>
                            <Form.Item name="descriptionEng" label="Təsvir (EN)">
                                <Input.TextArea
                                    placeholder="Təsvir daxil edin (EN)"
                                    className="rounded-md"
                                    rows={4}
                                />
                            </Form.Item>
                            <Form.Item name="descriptionRu" label="Təsvir (RU)">
                                <Input.TextArea
                                    placeholder="Təsvir daxil edin (RU)"
                                    className="rounded-md"
                                    rows={4}
                                />
                            </Form.Item>
                            <Form.Item
                                name="categoryId"
                                label="Kateqoriya"
                                rules={[{ required: true, message: "Kateqoriya seçin!" }]}
                            >
                                <Select
                                    placeholder="Kateqoriya seçin"
                                    className="rounded-md"
                                    showSearch
                                    filterOption={filterOption}
                                    options={getCategoryOptions()}
                                />
                            </Form.Item>
                            <Form.Item
                                name="productImage"
                                label="Şəkil"
                            >
                                <Upload {...editUploadProps} maxCount={1}>
                                    <div>
                                        <UploadOutlined />
                                        <div>Şəkil Yüklə</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item className="text-right">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="mr-2 bg-blue-500 hover:bg-blue-600 rounded-md"
                            loading={isUpdating}
                            disabled={isUpdating}
                        >
                            Düzəliş Et
                        </Button>
                        <Button onClick={handleEditCancel} className="rounded-md">
                            İmtina Et
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FoodTable;