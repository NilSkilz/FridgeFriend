import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';

class RecipesTable extends Component {
    render() {
        const { recipes, products, editCallback, deleteCallback } = this.props;
        if (!products || !recipes) return null;
        console.log(recipes);
        return (
            <Table responsive hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Servings</th>
                        <th>Stock</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {recipes &&
                        recipes.map((recipe, index) => {
                            let inStock = 0;
                            let ofStock = 0;
                            recipe.ingredients.forEach(ingredient => {
                                const product = products.find(
                                    product => product._id === ingredient.product
                                );
                                if (product.stock.length >= ingredient.quantity) inStock++;
                                ofStock += ingredient.quantity;
                            });
                            return (
                                <tr key={index} className="fade show">
                                    <td>{recipe.name}</td>
                                    <td>{recipe.servings}</td>
                                    <td>{`${inStock} / ${ofStock} in stock`}</td>
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
                                            onClick={deleteCallback}
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
