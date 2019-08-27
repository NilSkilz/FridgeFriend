import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Button } from 'reactstrap';
import { connect } from 'react-redux';
import ProductModal from '../../Modals/Product/ProductModal';
import ProductDeleteModal from '../../Modals/Product/ProductDeleteModal';
import DataTable from '../../Tables/DataTable';
import ISProductRow from '../../Tables/Product/InStockProductRow';
import OOSProductRow from '../../Tables/Product/OutOfStockProductRow';

class ProductsCard extends Component {
    addProduct = () => {
        this.props.dispatch({
            type: 'EDIT_PRODUCT',
            product: {}
        });
    };

    render() {
        const { hideInStock, title, filter, headers, add } = this.props;
        return (
            <Fragment>
                <ProductModal />
                <ProductDeleteModal />
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
                                        onClick={this.addProduct}
                                    >
                                        Add
                                    </Button>
                                </Col>
                            ) : null}
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <DataTable
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
const mapStateToProps = state => ({
    products: state.products
});

export default connect(mapStateToProps)(ProductsCard);
