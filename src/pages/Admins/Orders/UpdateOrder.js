import { useHistory, useParams } from 'react-router-dom';
import TopPage from '../../../layouts/AdminLayout/Toppage/TopPage';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Space, Table, Select, Image, Radio } from 'antd';

import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useDispatch, useSelector } from 'react-redux';
import { loadProductStart } from '../../../Redux/actions/productAction';
import { loadCategoryStart } from '../../../Redux/actions/categoryAction';
import { toast } from 'react-toastify';
import { getOrderById } from '../../../apis/OrderApi';
import TableUpdateOrder from './TableUpdateOrder';
import { updateOrderStart } from '../../../Redux/actions/orderAction';


const { Option } = Select;
const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 4,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 24,
        },
    },
};
const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 10,
        },
    },
};


const UpdateOrder = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    let history = useHistory();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [bottom, setBottom] = useState('bottomCenter');
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const { products } = useSelector((state) => state.products);
    const { categories } = useSelector(state => state.categories);
    const [cartProducts, setCartProducts] = useState([]);

    //load data product
    useEffect(() => {
        dispatch(loadProductStart());
        dispatch(loadCategoryStart());
    }, []);
    useEffect(() => {
        getDataById(id)
    }, [id])

    const getDataById = async (id) => {
        try {
            const data = await getOrderById(id);
            data && form.setFieldsValue({
                fullname: data.fullname,
                email: data.email,
                phoneNumber: data.phoneNumber,
                address: data.address,
                status: data.status,
                address: data.address
            });
            data && setCartProducts(
                data.cartProducts
            )
        } catch (error) {
            console.log(error);
        }
    }

    const onFinish = (data) => {
        const dataValue = {
            ...data,
            cartProducts,
            totalPrice
        }
        if (!data) return;
        dispatch(updateOrderStart({ id, dataValue }));
        setTimeout(() => history.push('/adminUI/orders'), 500);
        toast.success("????n h??ng ???????c c???p nh???t th??nh c??ng!!");
    };

    //search data
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1890ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    const handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const totalPrice = (cartProducts) && (cartProducts).reduce((a, c) => a + c.quantity * c.priceNew, 0);

    const handleAddCart = (product) => {
        const listProducts = cartProducts.find((item) => item.id === product.id && item.size === product.size);
        if ((!listProducts)) {
            setCartProducts([...cartProducts, { ...product, quantity: 1 }])
        }
        else {
            let newcart = cartProducts;
            const objIndex = newcart.findIndex(
                (obj) => obj.id === product.id && obj.size === product.size
            );
            newcart[objIndex].quantity = newcart[objIndex].quantity + 1;
            setCartProducts([...newcart])
        }

    }

    const onDecrease = (product) => {
        const listProducts = cartProducts.find((item) => item.id === product.id && item.size === product.size);
        if (listProducts.quantity === 1) {
            let newcart = cartProducts;
            const objIndex = newcart.findIndex(
                (obj) => obj.id === product.id && obj.size === product.size
            );
            newcart[objIndex].quantity = newcart[objIndex].quantity - 1;
            newcart = newcart.filter(item => item.quantity !== 0)
            setCartProducts([...newcart])
        } else {
            setCartProducts(
                cartProducts.map(item =>
                    (item.id === product.id && item.size === product.size) ? { ...listProducts, quantity: listProducts.quantity - 1 } : item
                )
            )
        }
    }
    const onDeleteProduct = (product) => {
        const listProducts = cartProducts.find(item =>
            (item.id === product.id) && (item.size === product.size))
        const newListProducts = cartProducts.filter(item => item !== listProducts)
        setCartProducts(newListProducts)
    }

    const [size, setSize] = useState('');

    const onChange = (e) => {
        console.log('radio checked', e.target.value);
        setSize(e.target.value);
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: '',
            key: '',
            width: '5%',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'T??n s???n ph???m',
            dataIndex: '',
            key: '',
            width: '40%',
            ...getColumnSearchProps('productName'),
            sorter: (a, b) => a.category.length - b.category.length,
            render: (item) => {
                return (
                    <>
                        <div className="d-flex align-items-center">
                            <Image
                                width={30}
                                src={item.url}
                            />
                            <span className="ml-2">{item.productName}</span>
                        </div>
                        {item.category === "Tr?? s???a" &&
                            < Radio.Group onChange={onChange} >
                                <Radio value="S">S</Radio>
                                <Radio value="L">L</Radio>
                            </Radio.Group>
                        }
                    </>
                )
            }
        },
        {
            title: 'Danh m???c',
            dataIndex: 'category',
            key: 'category',
            width: '20%',
            filters:
                categories.map((item, index) => (
                    {
                        key: index,
                        text: item.categoryName,
                        value: item.categoryName,
                    }
                ))
            ,
            onFilter: (value, record) => record.category.includes(value),
            sorter: (a, b) => a.category.length - b.category.length,
        },
        {
            title: 'Gi?? ti???n',
            dataIndex: '',
            key: '',
            width: '20%',
            sorter: (a, b) => a.priceNew.length - b.priceNew.length,
            ...getColumnSearchProps('priceNew'),
            render: (item) => {
                return (
                    Number(item.priceNew).toLocaleString('vi', { style: 'currency', currency: 'VND' })
                )
            }
        },
        {
            title: 'Action',
            dataIndex: '',
            key: '',
            render: (item) => {
                return (
                    <span className="add-cart">
                        <i className="fas fa-cart-plus" onClick={() => handleAddCart({ ...item, size: size })}></i>
                    </span>
                )
            },
        },
    ];


    return (
        <>
            <TopPage title="Qu???n l?? ????n h??ng" title1="C???p nh???t ????n h??ng" />
            <span className="back-admin-user " onClick={() => { history.push('/adminUI/orders') }}>
                <i className="fas fa-arrow-left"></i>&nbsp;
                Quay l???i
            </span>
            <h5 className="text-uppercase text-center mb-2">C???p nh???t ????n h??ng</h5>
            <div className="row order-container mt-5">
                <div className="col-md-6 p-3">
                    <h5>Danh s??ch s???n ph???m ({products.length} s???n ph???m)</h5>
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey='id'
                        pagination={{
                            position: [bottom],
                        }}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-6 p-3">
                    <h5 className="mb-3">Th??ng tin kh??ch h??ng</h5>
                    <Form
                        {...formItemLayout}
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        scrollToFirstError
                    >
                        <Form.Item
                            label="H??? t??n"
                            name="fullname"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui l??ng nh???p h??? t??n!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="E-mail"
                            name="email"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="?????a ch???"
                            name="address"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="SDT"
                            name="phoneNumber"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui l??ng nh???p s??? ??i???n tho???i!',
                                },
                                {
                                    len: 10,
                                    message: 'S??? ??i???n tho???i ph???i 10 s???.'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label="Tr???ng th??i"
                            rules={[
                                {
                                    type: 'text',
                                },
                            ]}
                        >
                            <Select>
                                <Option value="Ch??? x??c nh???n">Ch??? x??c nh???n</Option>
                                <Option value="??ang chu???n b???">??ang chu???n b???</Option>
                                <Option value="??ang v???n chuy???n">??ang v???n chuy???n</Option>
                                <Option value="Giao th??nh c??ng">Giao th??nh c??ng</Option>
                                <Option value="???? h???y">???? h???y</Option>
                            </Select>
                        </Form.Item>
                        <TableUpdateOrder
                            onAdd={handleAddCart}
                            onDecrease={onDecrease}
                            onDeleteProduct={onDeleteProduct}
                            totalPrice={totalPrice}
                            cartProducts={cartProducts}
                        />
                        <Form.Item {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit">
                                C???p nh???t
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default UpdateOrder;
