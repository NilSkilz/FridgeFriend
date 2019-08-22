import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Button } from 'reactstrap';
import moment from 'moment';
import Axios from 'axios';
import RecipesTable from '../../Tables/Recipes/RecipesTable';
import RecipeModal from '../../Modals/Recipes/RecipeModal';

class RecipesCard extends Component {
    state = { showAddRecipeModal: false, refresh: moment() };

    componentDidMount() {
        this.getData();
    }

    getData = () => {
        this.getProducts().then(this.getRecipes());
    };

    getRecipes = () =>
        Axios.get('/api/recipes')
            .then(({ data }) => {
                this.setState({ recipes: data.data });
            })
            .catch(err => this.error(err));

    getProducts = () =>
        Axios.get('/api/products')
            .then(({ data }) => {
                this.setState({ products: data.data });
            })
            .catch(err => this.error(err));

    editCallback = event => {
        const index = event.target.id;
        const { recipes } = this.state;
        const recipe = recipes[index];
        this.setState({ recipe });
        this.toggleAddRecipeModal();
    };

    deleteCallback = event => {
        const index = event.target.id;
        const { recipes } = this.state;
        const recipe = recipes[index];
        this.setState({ recipe });
        this.toggleAddRecipeModal();
    };

    toggleAddRecipeModal = () => {
        const { showAddRecipeModal } = this.state;
        this.setState({ showAddRecipeModal: !showAddRecipeModal });
        this.refresh();
    };

    refresh = () => {
        this.setState({ refresh: moment() });
    };

    render() {
        const { refresh, showAddRecipeModal, recipes, products, recipe } = this.state;
        const { title } = this.props;
        return (
            <Fragment>
                <RecipeModal
                    className="modal-xl"
                    show={showAddRecipeModal}
                    addRecipe={this.addRecipe}
                    closeModal={this.toggleAddRecipeModal}
                    recipe={recipe}
                />

                <Card>
                    <CardHeader>
                        <Row>
                            <Col col="2">
                                <i className="fa fa-align-justify" /> {title}
                            </Col>
                            <Col col="2" className="mb-xl-0 text-center">
                                <Button
                                    color="primary"
                                    className="float-right"
                                    onClick={this.toggleAddRecipeModal}
                                >
                                    Add Recipe
                                </Button>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <RecipesTable
                            refresh={refresh}
                            recipes={recipes}
                            products={products}
                            editCallback={this.editCallback}
                            deleteCallback={this.deleteCallback}
                        />
                    </CardBody>
                </Card>
            </Fragment>
        );
    }
}

export default RecipesCard;
