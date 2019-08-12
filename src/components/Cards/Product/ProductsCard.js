import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Button } from 'reactstrap';
import ProductTable from '../../Tables/Product/ProductTable';
import ProductModal from '../../Modals/Product/ProductModal';
import moment from 'moment';

class ProductsCard extends Component {
    state = { showAddProductModal: false, refresh: moment() };
    toggleAddProductModal = () => {
        const { showAddProductModal } = this.state;
        if (showAddProductModal) {
            this.setState({ product: null });
        }
        this.setState({ showAddProductModal: !showAddProductModal });
    };

    editProduct = product => {
        this.setState({ product }, () => {
            this.toggleAddProductModal();
        });
    };

    render() {
        const { showAddProductModal, refresh, product } = this.state;
        const { hideInStock, hideOutOfStock, title } = this.props;
        return (
            <Fragment>
                <ProductModal
                    show={showAddProductModal}
                    addProduct={this.addProduct}
                    closeModal={this.toggleAddProductModal}
                    product={product}
                />

                <Card>
                    <CardHeader>
                        <Row>
                            <Col col="2" className={hideInStock ? null : 'pt-2'}>
                                <i className="fa fa-align-justify" /> {title}
                            </Col>
                            {hideInStock ? null : (
                                <Col col="2" className="mb-xl-0 text-center">
                                    <Button
                                        color="primary"
                                        className="float-right"
                                        onClick={this.toggleAddProductModal}
                                    >
                                        Add
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <ProductTable
                            refresh={refresh}
                            hideInStock={hideInStock}
                            hideOutOfStock={hideOutOfStock}
                            editProduct={this.editProduct}
                        />
                    </CardBody>
                </Card>
            </Fragment>
        );
    }
}

export default ProductsCard;
