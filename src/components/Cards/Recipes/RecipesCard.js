import React, { Component, Fragment } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Button } from 'reactstrap';
import { connect } from 'react-redux';
import RecipesTable from '../../Tables/Recipes/RecipesTable';
import RecipeModal from '../../Modals/Recipes/RecipeModal';

class RecipesCard extends Component {
    state = { showAddRecipeModal: false };

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

    addRecipe = () => {
        this.props.dispatch({
            type: 'EDIT_RECIPE',
            recipe: {
                ingredients: [
                    {
                        quantity: 1
                    }
                ]
            }
        });
    };

    render() {
        const { title, recipe } = this.props;
        return (
            <Fragment>
                <RecipeModal show={recipe ? true : false} />
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
                                    onClick={this.addRecipe}
                                >
                                    Add Recipe
                                </Button>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <RecipesTable
                            editCallback={this.editCallback}
                            deleteCallback={this.deleteCallback}
                        />
                    </CardBody>
                </Card>
            </Fragment>
        );
    }
}
const mapStateToProps = state => ({
    recipes: state.recipes,
    recipe: state.recipe
});

export default connect(mapStateToProps)(RecipesCard);
