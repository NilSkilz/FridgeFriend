import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Button } from 'reactstrap';
import moment from 'moment';
import ShoppingListTable from '../../Tables/ShoppingList/ShoppingListTable';

class ShoppingListCard extends Component {
    state = { showAddProductModal: false, refresh: moment() };
    toggleAddProductModal = () => {
        const { showAddProductModal } = this.state;
        this.setState({ showAddProductModal: !showAddProductModal });
        this.refresh();
    };

    refresh = () => {
        this.setState({ refresh: moment() });
    };

    render() {
        const { refresh } = this.state;
        const { hideInStock, title } = this.props;
        return (
            <Fragment>
                {/* <ProductModal
                    show={showAddProductModal}
                    addProduct={this.addProduct}
                    closeModal={this.toggleAddProductModal}
                /> */}

                <Card>
                    <CardHeader>
                        <Row>
                            <Col col="2">
                                <i className="fa fa-align-justify" /> {title}
                            </Col>
                            {hideInStock ? null : (
                                <Col col="2" className="mb-xl-0 text-center">
                                    <Button
                                        color="primary"
                                        className="float-right"
                                        onClick={this.toggleAddProductModal}
                                    >
                                        Add Item
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <ShoppingListTable refresh={refresh} />
                    </CardBody>
                </Card>
            </Fragment>
        );
    }
}

export default ShoppingListCard;
