import React, { Component, Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Axios from 'axios';
import { connect } from 'react-redux';

class RecipeDeleteModal extends Component {
    state = { recipe_delete: null };

    componentDidUpdate(props) {
        const { recipe_delete } = this.props;
        if (recipe_delete !== this.state.recipe_delete) this.setState({ recipe_delete });
    }

    deleteRecipe = () => {
        const { recipe_delete } = this.state;
        Axios.delete(`/api/recipes/${recipe_delete._id}`).then(({ data }) => {
            this.props.dispatch({ type: 'DELETE_RECIPE_CONFIRM', recipe: recipe_delete });
            this.close();
        });
    };

    close = () => {
        this.props.dispatch({ type: 'DELETE_RECIPE', recipe: null });
    };

    render() {
        const { recipe_delete } = this.state;
        if (!recipe_delete) return null;
        return (
            <Fragment>
                <Modal isOpen={recipe_delete ? true : false} autoFocus={false}>
                    <ModalHeader>Delete Recipe</ModalHeader>
                    <ModalBody>Are you sure?</ModalBody>
                    <ModalFooter>
                        <Button block color="secondary" onClick={this.close} className="mt-0">
                            Close
                        </Button>
                        <Button block color="danger" onClick={this.deleteRecipe}>
                            Delete
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    recipe_delete: state.recipe_delete
});

export default connect(mapStateToProps)(RecipeDeleteModal);
