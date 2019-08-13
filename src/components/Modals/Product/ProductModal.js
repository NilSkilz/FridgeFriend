import React, { Component, Fragment } from 'react';
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Input,
    Alert,
    Col,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';
import Axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import Select from 'react-select';

class ProductModal extends Component {
    state = { success: false, error: false, showForm: false, product: {} };

    componentDidMount() {
        this.getDepartments();
        this.getSuperDepartments();
    }

    componentWillReceiveProps() {
        const { product } = this.props;
        if (product) this.setState({ product: product, showForm: true });
    }

    getDepartments = () => {
        Axios.get('/api/departments').then(({ data }) => {
            const departmentOptions = data.data.map(department => {
                return {
                    label: department.name,
                    value: department._id
                };
            });
            this.setState({ departmentOptions });
        });
    };

    getSuperDepartments = () => {
        Axios.get('/api/superdepartments').then(({ data }) => {
            const superDepartmentOptions = data.data.map(department => {
                return {
                    label: department.name,
                    value: department._id
                };
            });
            this.setState({ superDepartmentOptions });
        });
    };

    handleChange = event => {
        event.preventDefault();
        const { value: barcode } = event.target;
        let { product } = this.state;
        if (!product) product = {};
        product.gtin = barcode;
        this.setState({ product });

        if (barcode.length === 13) {
            this.getProductFromAPI(barcode);
        }
    };

    handleError = err => {
        this.setState({ error: err.message });
        console.log('Got Error', err);
    };

    getProductFromAPI = barcode => {
        Axios.get(`/api/products/${barcode}`)
            .then(({ data }) => {
                if (!data.data) {
                    this.getProductFromLabsAPI(barcode);
                } else {
                    this.addProductToStock(data.data);
                }
            })
            .catch(err => this.handleError(err));
    };

    getProductFromLabsAPI = barcode => {
        Axios.get(`https://dev.tescolabs.com/product/?gtin=${barcode}`, {
            headers: {
                'Ocp-Apim-Subscription-Key': 'ae8dba96f0f34dbb90e3c8706b4b7b0b'
            }
        })
            .then(({ data }) => {
                const { products } = data;
                if (products && products.length > 0) {
                    this.getAdditionalInfoFromLabsAPI(products[0]);
                } else {
                    throw new Error('Not Found');
                }
            })
            .catch(err => this.handleError(err));
    };

    getAdditionalInfoFromLabsAPI = product => {
        Axios.get(
            `https://dev.tescolabs.com/grocery/products/?query=${
                product.description
            }&offset=0&limit=10`,
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': 'ae8dba96f0f34dbb90e3c8706b4b7b0b'
                }
            }
        )
            .then(({ data }) => {
                const results = _.get(data, 'uk.ghs.products.results', []);
                const item = results.find(item => item.tpnb === parseInt(product.tpnb));

                product.name = product.description;

                if (item) {
                    product.image = item.image;
                    product.department = item.department;
                    product.superDepartment = item.superDepartment;
                    product.price = item.price;
                } else {
                    product.minimum_stock = 2;
                    this.setState({ product });
                    throw new Error('Cannot find complete product details');
                }
                this.saveProduct(product);
            })
            .catch(err => this.handleError(err));
    };

    saveProduct = product => {
        if (!product._id) {
            Axios.post(`/api/products/`, product, {
                headers: { 'Content-Type': 'application/json' }
            })
                .then(({ data }) => {
                    this.addProductToStock(data.data);
                })
                .catch(err => this.handleError(err));
        } else {
            Axios.put(`/api/products/${product._id}`, product, {
                headers: { 'Content-Type': 'application/json' }
            })
                .then(({ data }) => {
                    this.setState({ product: product, success: 'Product updated' });
                    setTimeout(() => {
                        this.setState({ success: false });
                    }, 3000);
                })
                .catch(err => this.handleError(err));
        }
    };

    addProductToStock = product => {
        const payload = {
            product: product._id,
            quantity: product.qtyContents.numberOfUnits || 1
        };
        if (product.best_before) {
            payload.best_before_date = moment()
                .startOf('day')
                .add(product.best_before.value, product.best_before.unit);
        }
        Axios.post(`/api/stock/`, payload)
            .then(() => {
                this.setState({
                    product: null,
                    success: `Added 1x ${product.name}`
                });
                setTimeout(() => {
                    this.setState({ success: false });
                }, 3000);
            })
            .catch(err => this.handleError(err));
    };

    close = () => {
        const { closeModal } = this.props;
        this.setState({ product: {}, showForm: false });
        closeModal();
    };

    save = () => {
        const { product } = this.state;
        this.saveProduct(product);
    };

    decreaseMinStock = () => {
        const { product } = this.state;
        product.minimum_stock--;
        this.setState({ product });
    };

    increaseMinStock = () => {
        const { product } = this.state;
        product.minimum_stock++;
        this.setState({ product });
    };

    minStockChanged = event => {
        const { product } = this.state;
        product.minimum_stock = event.target.value;
        this.setState({ product });
    };

    render() {
        const { show } = this.props;
        const { success, error, product, departmentOptions, superDepartmentOptions } = this.state;

        return (
            <Fragment>
                <Modal isOpen={show} autoFocus={false}>
                    <ModalHeader>Add Product</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={event => event.preventDefault()}>
                            <FormGroup>
                                <Alert color="success" isOpen={success}>
                                    {success}
                                </Alert>
                                <Alert color="danger" isOpen={error}>
                                    {error}
                                </Alert>

                                <Label for="barcode">Barcode</Label>
                                <Input
                                    autoFocus
                                    ref={input => {
                                        this.barcodeInput = input;
                                    }}
                                    value={product.gtin}
                                    type="input"
                                    name="barcode"
                                    id="barcode"
                                    // value={product.barcode}
                                    onChange={this.handleChange}
                                />
                                {product.name ? (
                                    <Fragment>
                                        <Label className="pt-3" for="name">
                                            Name
                                        </Label>
                                        <Input
                                            value={product.name}
                                            type="input"
                                            name="name"
                                            id="name"
                                            onChange={this.handleChange}
                                        />
                                        <Label className="pt-3" for="price">
                                            Price
                                        </Label>
                                        <Input
                                            value={product.price}
                                            type="input"
                                            name="price"
                                            id="price"
                                            onChange={this.handleChange}
                                        />
                                        <Label className="pt-3" for="price">
                                            Minimum Stock
                                        </Label>
                                        <Col xs="4" lg="4" className="d-flex p-0">
                                            <InputGroup>
                                                <InputGroupAddon addonType="prepend">
                                                    <Button
                                                        type="button"
                                                        color="secondary"
                                                        onClick={this.increaseMinStock}
                                                        style={{ zIndex: 'auto' }}
                                                    >
                                                        <i
                                                            className="cui-chevron-top icons"
                                                            style={{ color: '#fff' }}
                                                        />
                                                    </Button>
                                                </InputGroupAddon>
                                                <Input
                                                    type="text"
                                                    value={product.minimum_stock}
                                                    onChange={this.minStockChanged}
                                                    style={{ height: 'auto' }}
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <Button
                                                        type="button"
                                                        color="secondary"
                                                        onClick={this.decreaseMinStock}
                                                        style={{ zIndex: 'auto' }}
                                                    >
                                                        <i
                                                            className="cui-chevron-bottom icons"
                                                            style={{ color: '#fff' }}
                                                        />
                                                    </Button>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </Col>
                                        <Label className="pt-3" for="price">
                                            Department
                                        </Label>
                                        <Select
                                            className="basic-single"
                                            defaultValue={departmentOptions[0]}
                                            value={departmentOptions.find(
                                                option => option.value === product.department
                                            )}
                                            name="department"
                                            options={departmentOptions}
                                        />

                                        <Label className="pt-3" for="price">
                                            Supermarket Department
                                        </Label>
                                        <Select
                                            className="basic-single"
                                            defaultValue={superDepartmentOptions[0]}
                                            value={superDepartmentOptions.find(
                                                option => option.value === product.superDepartment
                                            )}
                                            name="superDepartment"
                                            options={superDepartmentOptions}
                                        />
                                    </Fragment>
                                ) : null}
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.close}>
                            Close
                        </Button>
                        <Button color="primary" onClick={this.save}>
                            Save
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}

export default ProductModal;
