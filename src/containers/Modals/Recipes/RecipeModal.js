import React, { Component, Fragment } from 'react';
import Select from 'react-select';
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
    Col,
    Row,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';
import Axios from 'axios';

class ProductModal extends Component {
    state = { recipe: { ingredients: [{ quantity: 1 }] }, options: [] };

    componentDidMount() {
        this.getProducts();
    }

    componentWillReceiveProps(props) {
        const { recipe } = props;
        if (recipe) this.setState({ recipe });
    }

    handleChange = event => {
        event.preventDefault();
        const { recipe } = this.state;
        const key = event.target.id;
        recipe[key] = event.target.value;
        this.setState({ recipe });
    };

    handleServings = event => {
        const { recipe } = this.state;
        recipe.servings = event.value;
        this.setState({ recipe });
    };

    handleError = err => {
        this.setState({ error: err.message });
        console.log('Got Error', err);
    };

    getProducts = () => {
        Axios.get('/api/products/')
            .then(({ data }) => this.formatProducts(data.data))
            .catch(err => this.handleError(err));
    };

    formatProducts = products => {
        const options = products.map(product => {
            return {
                label: product.name,
                value: product._id
            };
        });
        console.log(options);
        this.setState({ options });
    };

    addProduct = (event, type) => {
        const { recipe } = this.state;
        event.quantity = 1;
        recipe.ingredients[type.name] = event;
        console.log(recipe);
        this.setState({ recipe });
    };

    addRow = () => {
        const { recipe } = this.state;
        if (!recipe.ingredients) recipe.ingredients = [];
        recipe.ingredients.push({});
        this.setState({ recipe });
    };

    saveRecipe = () => {
        const { recipe } = this.state;
        const { closeModal } = this.props;
        if (!recipe._id) {
            Axios.post('/api/recipes', recipe).then(({ data }) => {
                closeModal();
            });
        } else {
            Axios.put(`/api/recipes/${recipe._id}`, recipe).then(({ data }) => {
                closeModal();
            });
        }
    };

    quantityChanged = event => {
        const { recipe } = this.state;
        const { ingredients } = recipe;
        ingredients[event.target.id].quantity = event.target.value;
        this.setState({ recipe });
    };

    quantityUp = event => {
        const { recipe } = this.state;
        const { ingredients } = recipe;
        ingredients[event.target.id].quantity = ingredients[event.target.id].quantity + 1;
        this.setState({ recipe });
    };

    quantityDown = event => {
        const { recipe } = this.state;
        const { ingredients } = recipe;
        ingredients[event.target.id].quantity = ingredients[event.target.id].quantity - 1;
        if (ingredients[event.target.id].quantity < 1) ingredients[event.target.id].quantity = 1;
        this.setState({ recipe });
    };

    deleteIngredient = event => {
        const index = event.target.id;
        const { recipe } = this.state;
        recipe.ingredients.splice(index, 1);
        this.setState({ recipe });
    };

    render() {
        const { show, closeModal } = this.props;
        const { recipe, options } = this.state;
        if (!options) return null;
        return (
            <Fragment>
                <Modal isOpen={show} autoFocus={false}>
                    <ModalHeader>Add Recipe</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={event => event.preventDefault()}>
                            <FormGroup>
                                <Label for="name">Name</Label>
                                <Input id="name" value={recipe.name} onChange={this.handleChange} />
                                <Label for="servings" className="mt-3">
                                    Servings
                                </Label>
                                <Select
                                    name="servings"
                                    id="servings"
                                    value={{ value: recipe.servings, label: recipe.servings }}
                                    options={[
                                        { value: '1', label: '1' },
                                        { value: '2', label: '2' },
                                        { value: '3', label: '3' },
                                        { value: '4', label: '4' },
                                        { value: '5', label: '5' },
                                        { value: '6', label: '6' },
                                        { value: '7', label: '7' },
                                        { value: '8', label: '8' }
                                    ]}
                                    onChange={this.handleServings}
                                />
                                <Label for="ingredients" className="mt-3">
                                    Ingredients
                                </Label>
                                {recipe.ingredients &&
                                    recipe.ingredients.map((ingredient, index) => {
                                        console.log(ingredient);
                                        return (
                                            <Row key={index} className="mt-3">
                                                <Col xs="12" lg="8">
                                                    <Select
                                                        name={index}
                                                        id={index}
                                                        value={{
                                                            label: ingredient.label,
                                                            value: ingredient.value
                                                        }}
                                                        options={options}
                                                        onChange={this.addProduct}
                                                    />
                                                </Col>
                                                <Col xs="12" lg="3" className="d-flex p-0">
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend">
                                                            <Button
                                                                type="button"
                                                                color="secondary"
                                                                id={index}
                                                                name={index}
                                                                onClick={this.quantityUp}
                                                                style={{ zIndex: 'auto' }}
                                                            >
                                                                <i
                                                                    className="cui-chevron-top icons"
                                                                    style={{ color: '#fff' }}
                                                                    id={index}
                                                                    name={index}
                                                                />
                                                            </Button>
                                                        </InputGroupAddon>
                                                        <Input
                                                            type="text"
                                                            id={index}
                                                            name={index}
                                                            value={ingredient.quantity}
                                                            onChange={this.quantityChanged}
                                                            style={{ height: 'auto' }}
                                                        />
                                                        <InputGroupAddon addonType="append">
                                                            <Button
                                                                type="button"
                                                                color="secondary"
                                                                id={index}
                                                                name={index}
                                                                onClick={this.quantityDown}
                                                                style={{ zIndex: 'auto' }}
                                                            >
                                                                <i
                                                                    className="cui-chevron-bottom icons"
                                                                    style={{ color: '#fff' }}
                                                                    id={index}
                                                                    name={index}
                                                                />
                                                            </Button>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </Col>
                                                <Col className="align-middle text-center m-0 p-0">
                                                    <i
                                                        className="fa fa-close icons"
                                                        style={{
                                                            color: '#999',
                                                            lineHeight: '36px'
                                                        }}
                                                        id={index}
                                                        name={index}
                                                        onClick={this.deleteIngredient}
                                                    />
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                <Button
                                    color="primary"
                                    className="float-right mt-3"
                                    onClick={this.addRow}
                                >
                                    Add
                                </Button>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button block color="primary" onClick={this.saveRecipe}>
                            Save
                        </Button>
                        <Button block color="secondary" onClick={closeModal} className="mt-0">
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}

export default ProductModal;
