import './index.scss';
import React, {useState, useEffect, useCallback} from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Popconfirm,
    Row,
    Col,
    message,
    Upload,
    Image,
} from "antd";
import {FaRegEdit} from "react-icons/fa";
import {MdDeleteForever} from "react-icons/md";
import {UploadOutlined, DragOutlined, SearchOutlined} from "@ant-design/icons";
import {
    useDeleteProductsMutation,
    useGetCategorysByIdQuery,
    usePostProductsMutation,
    usePutProductsMutation,
    usePutPoductsOrderMutation,
    useDeleteProductsImageMutation, // Yeni endpoint için mutasyon
} from "/src/services/userApi.jsx";
import {PRODUCT_IMAGES} from "/src/contants.js";
import {useDrag, useDrop} from 'react-dnd';
import update from 'immutability-helper';
import showToast from "../../../components/ToastMessage.js";

const ItemTypes = {
    ROW: 'row',
};

// DraggableRow component
const DraggableRow = ({index, moveRow, className, style, ...restProps}) => {
    const ref = React.useRef();
    const [{isOver, dropClassName}, drop] = useDrop({
        accept: ItemTypes.ROW,
        collect: (monitor) => {
            const {index: dragIndex} = monitor.getItem() || {};
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
    const [{isDragging}, drag] = useDrag({
        type: ItemTypes.ROW,
        item: {index},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    drop(drag(ref));

    return (
        <tr
            ref={ref}
            className={`${className} ${isOver ? dropClassName : ''}`}
            style={{cursor: 'move', ...style, opacity: isDragging ? 0.5 : 1}}
            {...restProps}
        />
    );
};

const AdminCategoryDetailTable = ({id}) => {
    const {data: getAllProducts, refetch: refetchFoods} = useGetCategorysByIdQuery(id);
    const foods = getAllProducts?.data || {products: [], subCategories: []};
    const [postFood, {isLoading: isAdding}] = usePostProductsMutation();
    const [putFood, {isLoading: isUpdating}] = usePutProductsMutation();
    const [deleteFood] = useDeleteProductsMutation();
    const [putProductsOrder, {isLoading: isOrdering}] = usePutPoductsOrderMutation();
    const [deleteProductImage] = useDeleteProductsImageMutation(); // Yeni endpoint mutasyonu
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModal, setIsEditModal] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [editingFood, setEditingFood] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [editFileList, setEditFileList] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Initialize products with orderId
    useEffect(() => {
        if (foods.products) {
            const newProducts = foods.products.map((product, index) => ({
                ...product,
                categoryName: foods.name,
                orderId: product.orderId || index.toString(),
            }));
            if (JSON.stringify(products) !== JSON.stringify(newProducts)) {
                setProducts(newProducts);
            }
        }
    }, [foods]);

    // Helper function to get category or subcategory name by ID
    const getCategoryName = (categoryId) => {
        if (categoryId === foods.id) return foods.name;
        const subCategory = foods.subCategories.find((sub) => sub.id === categoryId);
        return subCategory ? subCategory.name : "Bilinməyən";
    };

    // Image upload handlers
    const handleUploadChange = ({fileList}) => {
        setFileList(fileList.slice(-1)); // Keep only one file
    };

    const handleEditUploadChange = ({fileList}) => {
        setEditFileList(fileList.slice(-1)); // Keep only one file
    };

    // Modal handlers
    const showAddModal = () => {
        form.resetFields();
        form.setFieldsValue({categoryId: id});
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
            categoryId: id,
        });
        setEditFileList(
            record.productImage
                ? [{uid: "-1", name: "image", status: "done", url: PRODUCT_IMAGES + record.productImage}]
                : []
        );
        setIsEditModal(true);
    };

    const handleAddCancel = () => {
        setIsAddModalVisible(false);
        form.resetFields();
        setFileList([]);
    };

    const handleEditCancel = () => {
        setIsEditModal(false);
        editForm.resetFields();
        setEditFileList([]);
        setEditingFood(null);
    };

    // Reordering handlers
    const handleReOrder = useCallback(async (updatedProducts) => {
        try {
            const payload = updatedProducts.map((product, index) => ({
                id: product.id,
                orderId: index.toString(),
            }));
            await putProductsOrder(payload).unwrap();
            showToast("Sıralama uğurla yeniləndi!",'success');
        } catch (error) {
            console.error("Error updating product order:", error);
            showToast("Sıralama yenilənərkən xəta baş verdi!","error");
        }
    }, [putProductsOrder]);

    const moveRow = useCallback(
        (dragIndex, hoverIndex) => {
            const dragRow = products[dragIndex];
            const newProducts = update(products, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragRow],
                ],
            });
            setProducts(newProducts);
            const timeout = setTimeout(() => {
                handleReOrder(newProducts);
            }, 300);
            return () => clearTimeout(timeout);
        },
        [products, handleReOrder]
    );

    // Form submission handlers
    const handleAddFood = async (values) => {
        const {name, nameEng, nameRu, description, descriptionEng, descriptionRu, price} = values;

        const payload = new FormData();
        payload.append("name", name);
        payload.append("nameEng", nameEng);
        payload.append("nameRu", nameRu);
        payload.append("description", description || "");
        payload.append("descriptionEng", descriptionEng || "");
        payload.append("descriptionRu", descriptionRu || "");
        payload.append("price", parseFloat(price));
        payload.append("categoryId", id);
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
        const {name, nameEng, nameRu, description, descriptionEng, descriptionRu, price} = values;

        const payload = new FormData();
        payload.append("id", editingFood.id);
        payload.append("name", name);
        payload.append("nameEng", nameEng);
        payload.append("nameRu", nameRu);
        payload.append("description", description || "");
        payload.append("descriptionEng", descriptionEng || "");
        payload.append("descriptionRu", descriptionRu || "");
        payload.append("price", parseFloat(price));
        payload.append("categoryId", id);
        if (editFileList[0]?.originFileObj) {
            payload.append("productImage", editFileList[0].originFileObj);
        }

        try {
            // Normal güncelleme işlemi
            await putFood(payload).unwrap();

            // Eğer editFileList boşsa ve önceden resim varsa, resim silme endpoint'ini çağır
            if (editFileList.length === 0 && editingFood.productImage) {
                await deleteProductImage(editingFood.id).unwrap();
            }

            message.success("Yemək uğurla yeniləndi!");
            setIsEditModal(false);
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

    // Filter products based on search query
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            title: "",
            key: "drag",
            width: 50,
            render: () => (
                <DragOutlined style={{cursor: "move", fontSize: 16, color: "#999"}}/>
            ),
        },
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
            dataIndex: "categoryName",
            key: "categoryName",
            render: (categoryName) => categoryName || "Bilinməyən",
        },
        {
            title: "Əməliyyatlar",
            key: "actions",
            render: (text, record) => (
                <div style={{display: "flex", gap: "8px", justifyContent: "center"}}>
                    <Button type="primary" onClick={() => showEditModal(record)}>
                        <FaRegEdit/>
                    </Button>
                    <Popconfirm
                        title="Silmək istədiyinizə əminsiniz?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Bəli"
                        cancelText="Xeyr"
                    >
                        <Button type="default" danger>
                            <MdDeleteForever/>
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    // Upload props for validation
    const uploadProps = {
        fileList,
        onChange: handleUploadChange,
        listType: "picture-card",
        maxCount: 1, // Sadece bir resim seçilebilir
    };

    const editUploadProps = {
        fileList: editFileList,
        onChange: handleEditUploadChange,
        listType: "picture-card",
        maxCount: 1, // Sadece bir resim seçilebilir
    };

    // Table components for react-dnd
    const components = {
        body: {
            row: DraggableRow,
        },
    };

    return (
        <div className="p-4">
            <div style={{marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center"}}>
                <Input
                    placeholder="Yemək adına görə axtar"
                    prefix={<SearchOutlined/>}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{width: 300, borderRadius: "6px"}}
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
                dataSource={filteredProducts}
                components={components}
                onRow={(record, index) => ({
                    index,
                    moveRow,
                })}
                scroll={{y: '72vh'}}
                pagination={false}
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
                                rules={[{required: true, message: "Ad daxil edin!"}]}
                            >
                                <Input placeholder="Ad daxil edin" className="rounded-md"/>
                            </Form.Item>
                            <Form.Item
                                name="nameEng"
                                label="Yemək Adı (EN)"
                                rules={[{required: true, message: "Ad daxil edin!"}]}
                            >
                                <Input placeholder="Ad daxil edin (EN)" className="rounded-md"/>
                            </Form.Item>
                            <Form.Item
                                name="nameRu"
                                label="Yemək Adı (RU)"
                                rules={[{required: true, message: "Ad daxil edin!"}]}
                            >
                                <Input placeholder="Ad daxil edin (RU)" className="rounded-md"/>
                            </Form.Item>
                            <Form.Item
                                name="price"
                                label="Qiymət"
                                rules={[
                                    {required: true, message: "Qiymət daxil edin!"},
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
                            <Form.Item name="categoryId" hidden>
                                <Input/>
                            </Form.Item>
                            <Form.Item name="productImage" label="Şəkil">
                                <Upload {...uploadProps} maxCount={1}>
                                    <div>
                                        <UploadOutlined/>
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
                open={isEditModal}
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
                                rules={[{required: true, message: "Ad daxil edin!"}]}
                            >
                                <Input placeholder="Ad daxil edin" className="rounded-md"/>
                            </Form.Item>
                            <Form.Item
                                name="nameEng"
                                label="Yemək Adı (EN)"
                                rules={[{required: true, message: "Ad daxil edin!"}]}
                            >
                                <Input placeholder="Ad daxil edin (EN)" className="rounded-md"/>
                            </Form.Item>
                            <Form.Item
                                name="nameRu"
                                label="Yemək Adı (RU)"
                                rules={[{required: true, message: "Ad daxil edin!"}]}
                            >
                                <Input placeholder="Ad daxil edin (RU)" className="rounded-md"/>
                            </Form.Item>
                            <Form.Item
                                name="price"
                                label="Qiymət"
                                rules={[
                                    {required: true, message: "Qiymət daxil edin!"},
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
                            <Form.Item name="categoryId" hidden>
                                <Input/>
                            </Form.Item>
                            <Form.Item name="productImage" label="Şəkil">
                                <Upload {...editUploadProps} maxCount={1}>
                                    <div>
                                        <UploadOutlined/>
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

export default AdminCategoryDetailTable;