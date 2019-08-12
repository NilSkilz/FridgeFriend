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
    Alert
} from 'reactstrap';
import Axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

class ProductModal extends Component {
    state = { product: {}, visible: false, barcode: '', error: null };

    handleChange = event => {
        event.preventDefault();
        const { value: barcode } = event.target;
        this.setState({ barcode });

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
                    console.log(item);
                    product.image = item.image;
                    product.department = item.department;
                    product.superDepartment = item.superDepartment;
                    product.price = item.price;
                } else {
                    throw new Error('Cannot find complete product details');
                }
                this.createProduct(product);
            })
            .catch(err => this.handleError(err));
    };

    createProduct = product => {
        Axios.post(`/api/products/`, product, {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(({ data }) => {
                this.addProductToStock(data.data);
            })
            .catch(err => this.handleError(err));
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
                this.setState({ product: product.name, visible: true, barcode: '' });
                setTimeout(() => {
                    this.setState({ visible: false });
                }, 3000);
            })
            .catch(err => this.handleError(err));
    };

    render() {
        const { show, closeModal } = this.props;
        const { barcode, visible, product, error, showForm } = this.state;
        return (
            <Fragment>
                <Modal isOpen={show} autoFocus={false}>
                    <ModalHeader>Add Product</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={event => event.preventDefault()}>
                            <FormGroup>
                                <Alert color="success" isOpen={visible}>
                                    {`Added 1 x ${product}`}
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
                                    value={barcode}
                                    type="input"
                                    name="barcode"
                                    id="barcode"
                                    // value={product.barcode}
                                    onChange={this.handleChange}
                                />
                                {showForm ? (
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
                                    </Fragment>
                                ) : null}
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="secondary" onClick={closeModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}

export default ProductModal;
