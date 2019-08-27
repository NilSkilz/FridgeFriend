import React, { Component, Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Axios from 'axios';
import { connect } from 'react-redux';

class ProductDeleteModal extends Component {
    state = { product_delete: null };

    componentDidUpdate(props) {
        const { product_delete } = this.props;
        if (product_delete !== this.state.product_delete) this.setState({ product_delete });
    }

    deleteproduct = () => {
        const { product_delete } = this.state;
        Axios.delete(`/api/products/${product_delete._id}`).then(({ data }) => {
            this.props.dispatch({ type: 'DELETE_PRODUCT_CONFIRM', product: product_delete });
            this.close();
        });
    };

    close = () => {
        this.props.dispatch({ type: 'DELETE_PRODUCT', product: null });
    };

    render() {
        const { product_delete } = this.state;
        if (!product_delete) return null;
        return (
            <Fragment>
                <Modal isOpen={product_delete ? true : false} autoFocus={false}>
                    <ModalHeader>Delete product</ModalHeader>
                    <ModalBody>Are you sure?</ModalBody>
                    <ModalFooter>
                        <Button block color="secondary" onClick={this.close} className="mt-0">
                            Close
                        </Button>
                        <Button block color="danger" onClick={this.deleteproduct}>
                            Delete
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    product_delete: state.product_delete
});

export default connect(mapStateToProps)(ProductDeleteModal);
