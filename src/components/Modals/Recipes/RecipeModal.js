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

    componentDidUpdate(props) {
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
        this.setState({ options });
    };

    addProduct = (event, type) => {
        const { recipe } = this.state;
        event.quantity = 1;
        recipe.ingredients[type.name] = event;
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

    quantityChanged = ({ target }) => {
        const { id, value } = target;
        const { recipe } = this.state;
        const { ingredients } = recipe;
        ingredients[id].quantity = value;
        this.setState({ recipe });
    };

    quantityUp = ({ target }) => {
        const { id } = target;
        const { recipe } = this.state;
        const { ingredients } = recipe;
        let quantity = parseFloat(ingredients[id].quantity);

        if (quantity < 0.9) {
            quantity = (quantity + 0.1).toFixed(1);
        } else if (quantity === 0.9) {
            quantity = 1;
        } else {
            quantity = quantity + 1;
        }
        ingredients[id].quantity = quantity;
        this.setState({ recipe });
    };

    quantityDown = ({ target }) => {
        const { id } = target;
        const { recipe } = this.state;
        const { ingredients } = recipe;
        let quantity = parseFloat(ingredients[id].quantity);
        if (quantity <= 1) {
            if (quantity > 0.1) {
                quantity = (quantity - 0.1).toFixed(1);
            }
        } else {
            quantity = quantity - 1;
        }

        ingredients[id].quantity = quantity;
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
                <Modal isOpen={show} autoFocus={false} className="modal-lg">
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
                                <Row className="mt-3">
                                    <Col lg="8">
                                        <Label for="ingredients" className="mt-3">
                                            Ingredients
                                        </Label>
                                    </Col>
                                    <Col lg="2">
                                        <Label for="quantity" className="mt-3">
                                            Quantity
                                        </Label>
                                    </Col>
                                </Row>
                                {recipe.ingredients &&
                                    recipe.ingredients.map((ingredient, index) => {
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
                                                <Col xs="12" lg="2" className="d-flex p-0">
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
