import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';

class RecipesTable extends Component {
    render() {
        const { recipes, products } = this.props;
        if (!products || !recipes) return null;
        console.log(recipes);
        return (
            <Table responsive hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Servings</th>
                        <th>Stock</th>
                        <th className="text-right">Price</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {recipes &&
                        recipes.map((recipe, index) => {
                            let inStock = 0;
                            let ofStock = 0;
                            let totalPrice = 0;
                            let approx = false;
                            recipe.ingredients.forEach(ingredient => {
                                const product = products.find(
                                    product => product._id === ingredient.product
                                );
                                if (product.stock.length >= ingredient.quantity) inStock++;
                                ofStock += ingredient.quantity;
                                if (product.price) {
                                    totalPrice += ingredient.quantity * product.price;
                                } else {
                                    approx = true;
                                }
                            });
                            return (
                                <tr key={index} className="fade show">
                                    <td>{recipe.name}</td>
                                    <td>{recipe.servings}</td>
                                    <td>{`${inStock} / ${ofStock} in stock`}</td>
                                    <td className="text-right">{`${
                                        approx ? '~' : ''
                                    } £${totalPrice.toFixed(2)}`}</td>
                                    <td className="text-right">
                                        <i
                                            id={index}
                                            className="cui-pencil icons mr-3"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                this.props.dispatch({
                                                    type: 'EDIT_RECIPE',
                                                    recipe
                                                });
                                            }}
                                        />
                                        <i
                                            id={index}
                                            className="cui-trash icons mr-0 pr-0"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                this.props.dispatch({
                                                    type: 'DELETE_RECIPE',
                                                    recipe
                                                });
                                            }}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </Table>
        );
    }
}

const mapStateToProps = state => ({
    recipes: state.recipes,
    products: state.products
});

export default connect(mapStateToProps)(RecipesTable);
