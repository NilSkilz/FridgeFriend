var express = require('express');
var app = express();
var http = require('http').createServer(app);
var _ = require('lodash');
var mongoose = require('mongoose');
var Jimp = require('jimp');
var nocr = require('nocr');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
    bodyParser.urlencoded({
        // to support URL-encoded bodies
        extended: true
    })
);

// Connect to database
const uri = 'mongodb://127.0.0.1/grocy-dev';

mongoose.connect(uri, {});

var Product = require('./product/product.model');
var Stock = require('./stock/stock.model');
var Department = require('./department/department.model');
var SuperDepartment = require('./superdepartment/superdepartment.model');
var Recipe = require('./recipe/recipe.model');
var Log = require('./log/log.model');

handleError = error => {
    console.log(error);
};

// ----------------------
//  Products
// ------------

app.get('/api/products/:barcode', (req, res) => {
    query = {};
    if (req.params.barcode.length === 13) {
        query = { gtin: '0' + req.params.barcode };
    } else {
        query = { _id: req.params.barcode };
    }
    Product.findOne(query)
        .populate({
            path: 'stock',
            match: { consumed_date: { $exists: false } }
        })
        .exec()
        .then(product => {
            res.send({
                total: 1,
                page: 1,
                data: product
            });
        })
        .catch(err => handleError(err));
});

app.get('/api/products/', (req, res) => {
    Product.find(req.query.where)
        .populate({
            path: 'stock',
            match: { consumed_date: { $exists: false } }
        })
        .select(req.query.select)
        .sort(req.params.sort)
        .exec()
        .then(data => {
            res.send({
                data
            });
        })
        .catch(err => handleError(err));
});

app.put('/api/products/:id', (req, res) => {
    Product.findByIdAndUpdate(req.params.id, req.body)
        .exec()
        .then(data => {
            res.send({
                data
            });
        })
        .catch(err => handleError(err));
});

app.post('/api/products', (req, res) => {
    const { department, superDepartment } = req.body;

    getDepartment(department)
        .then(dept => {
            getSuperDepartment(superDepartment).then(superDept => {
                getBestBeforeDate(req.body.image).then(bestBefore => {
                    new Product({
                        ...req.body,
                        department: dept._id,
                        superDepartment: superDept._id,
                        best_before: bestBefore ? bestBefore : undefined,
                        _id: new mongoose.Types.ObjectId()
                    })
                        .save()
                        .then(data => {
                            const payload = {
                                total: 1,
                                page: 1,
                                data
                            };

                            res.send(payload);
                        });
                });
            });
        })
        .catch(err => handleError(err));
});

getDepartment = departmentName => {
    return new Promise((resolve, reject) => {
        Department.findOne({ name: departmentName })
            .exec()
            .then(dept => {
                if (!dept) {
                    new Department({
                        _id: new mongoose.Types.ObjectId(),
                        name: departmentName
                    })
                        .save()
                        .then(dept => resolve(dept));
                } else {
                    resolve(dept);
                }
            })
            .catch(err => handleError(err));
    });
};

getSuperDepartment = superDepartmentName => {
    return new Promise((resolve, reject) => {
        SuperDepartment.findOne({ name: superDepartmentName })
            .exec()
            .then(dept => {
                if (!dept) {
                    new SuperDepartment({
                        _id: new mongoose.Types.ObjectId(),
                        name: superDepartmentName
                    })
                        .save()
                        .then(dept => resolve(dept));
                } else {
                    resolve(dept);
                }
            })
            .catch(err => handleError(err));
    });
};

getBestBeforeDate = image => {
    return new Promise((resolve, reject) => {
        if (!image) resolve(null);
        Jimp.read(image.replace('http', 'https').replace('90x90', '540x540'))
            .then(image => {
                const filename = 'best-before.png';
                image
                    .crop(363, 0, 177, 177)
                    .writeAsync(filename)
                    .then(() => {
                        nocr.decodeFile(filename, function(error, data) {
                            if (error) return resolve(null);
                            if (data) {
                                const str = data.replace(/\s/g, '');

                                switch (str) {
                                    case '28+days':
                                        return resolve({ unit: 'days', value: '28' });
                                    default:
                                        return resolve(null);
                                }
                            } else {
                                return resolve(null);
                            }
                        });
                    });
                // Do stuff with the image.
            })
            .catch(err => {
                console.log(err);
                return resolve(null);
                // Handle an exception.
            });
    });
};

// ----------------------
//  Stocks
// ------------

app.put('/api/stock/:id', (req, res) => {
    Stock.findByIdAndUpdate(req.params.id, req.body)
        .exec()
        .then(stock => {
            res.send({
                data: stock
            });
            const difference = req.body.quantity - stock.quantity;
            if (difference > 0) {
                Product.findById(stock.product)
                    .exec()
                    .then(product => {
                        new Log({
                            _id: new mongoose.Types.ObjectId(),
                            stockChange: difference,
                            product: product
                        }).save();
                    });
            }
        })
        .catch(err => handleError(err));
});

app.post('/api/stock', (req, res) => {
    req.body._id = new mongoose.Types.ObjectId();
    new Stock(req.body)
        .save()
        .then(data =>
            Product.findById(req.body.product)
                .exec()
                .then(product => {
                    product.stock.push(data);
                    product.save().then(data => {
                        payload = {
                            total: 1,
                            page: 1,
                            data
                        };
                        res.send(payload);
                        new Log({
                            _id: new mongoose.Types.ObjectId(),
                            stockChange: 1,
                            product: product
                        }).save();
                    });
                })
        )
        .catch(err => handleError(err));
});

app.get('/api/logs', (req, res) => {
    Log.find({})
        .sort({ created_at: -1 })
        .exec()
        .then(logs => {
            res.send({
                data: logs
            });
        });
});

// ----------------------
//  Recipes
// ------------

app.get('/api/recipes/', (req, res) => {
    Recipe.countDocuments()
        .exec()
        .then(count => {
            Recipe.find()
                .exec()
                .then(recipes => {
                    res.send({
                        total: count,
                        page: 1,
                        data: recipes
                    });
                })
                .catch(err => handleError(err));
        })
        .catch(err => handleError(err));
});

app.post('/api/recipes/', (req, res) => {
    new Recipe(req.body)
        .save()
        .then(recipe => {
            const payload = {
                total: 1,
                page: 1,
                data: recipe
            };
            res.send(payload);
        })
        .catch(err => handleError(err));
});

app.put('/api/recipes/:id', (req, res) => {
    Recipe.findByIdAndUpdate(req.params.id, req.body)
        .exec()
        .then(recipe => {
            res.send({
                total: 1,
                page: 1,
                data: recipe
            });
        })
        .catch(err => handleError(err));
});

// ----------------------
//  Departments
// ------------

app.get('/api/departments', (req, res) => {
    Department.find()
        .exec()
        .then(departments => {
            res.send({
                total: departments.length,
                page: 1,
                data: departments
            });
        });
});

app.get('/api/superdepartments', (req, res) => {
    SuperDepartment.find()
        .exec()
        .then(departments => {
            res.send({
                total: departments.length,
                page: 1,
                data: departments
            });
        });
});

app.get('/api/auth', function(req, res) {
    res.json(user);
});

app.post('/api/auth/login', function(req, res) {
    user = _.cloneDeep(LOGGED_IN_USER);
    res.json(user);
});

app.post('/api/auth/logout', function(req, res) {
    user = false;
    res.json(user);
});

http.listen(4000, function() {
    console.log('Example app listening on port 4000!');
});
