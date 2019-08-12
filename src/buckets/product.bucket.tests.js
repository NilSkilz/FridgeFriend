var expect = require('chai').expect;

// import ProductBucket from './product.bucket';

var ProductBucket = require('./product.bucket');

describe('Product Bucket', function() {
    describe('constructor()', function() {
        it('should run subscribeToWebsockets', function(done) {
            this.bucket = ProductBucket;
            expect(bucket.products.length).to.equal('0');
        });
    });
});
