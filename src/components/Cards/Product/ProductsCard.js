import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Button } from 'reactstrap';
// import ProductTable from '../../Tables/Product/ProductTable';
import ProductModal from '../../Modals/Product/ProductModal';
import moment from 'moment';
import DataTable from '../../Tables/DataTable';
import ISProductRow from '../../Tables/Product/InStockProductRow';
import OOSProductRow from '../../Tables/Product/OutOfStockProductRow';

class ProductsCard extends Component {
    state = { showAddProductModal: false, refresh: moment() };
    toggleAddProductModal = () => {
        const { showAddProductModal } = this.state;
        if (showAddProductModal) {
            this.setState({ product: undefined });
        }
        this.setState({ showAddProductModal: !showAddProductModal });
    };

    editProduct = product => {
        this.setState({ product }, () => {
            this.toggleAddProductModal();
        });
    };

    refresh = () => {
        const { refresh } = this.props;
        this.setState({ state: this.state });
        if (refresh) refresh();
    };

    render() {
        const { showAddProductModal, product } = this.state;
        const { hideInStock, url, title, filter, headers, add } = this.props;
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
                            {add ? (
                                <Col col="2" className="mb-xl-0 text-center">
                                    <Button
                                        color="primary"
                                        className="float-right"
                                        onClick={this.toggleAddProductModal}
                                    >
                                        Add
                                    </Button>
                                </Col>
                            ) : null}
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <DataTable
                            url={url}
                            filter={filter}
                            headers={headers}
                            DataRow={add ? ISProductRow : OOSProductRow}
                            refresh={this.refresh}
                        />
                    </CardBody>
                </Card>
            </Fragment>
        );
    }
}

export default ProductsCard;
