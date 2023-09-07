const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    //throw new Error('testing async errors')
    
    const products = await Product.find({price:{$gt:30}})
        .sort('price')
        .select('name price')
        .limit(10)
        .skip(5)
    //[lines above] .sort('-name price') could be chained for sorting purposes; .select could be chained to display specific fields; .limit to limit the number of results; .skip to skip several results from the start of the list
    res.status(200).json({ products, nbHits: products.length })
}

const getAllProducts = async (req, res) => {
    //console.log(req.query)
    const { featured, company, name, sort, fields, numericFilters } = req.query
    const queryObject = {}

    if(featured) {
        queryObject.featured = featured === 'true'? true : false
    }
    if(company) {
        queryObject.company = company;
    }
    if(name) {
        queryObject.name = {$regex: name, $options: 'i'};
    }
    if(numericFilters) {
    //logic to substitute regular operator with operators understandable for mongoose
    //first, the operators are mapped inside an object, regEx is established, then values are replaced within numericFilters
        const operatorMap = {
            '>':'$gt',
            '>=':'$gte',
            '=':'$eq',
            '<':'$lt',
            '<=':'$lte'
        }
        const regEx = /\b(<|>|>=|=|<=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)
        const options = ['price','rating'];
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-');
            if(options.includes(field)) {
                queryObject[field] = {[operator]:Number(value)}
            }
        })
    }
    console.log(queryObject);
    let result = Product.find(queryObject);
    //sort functionality
    if(sort){
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList)
    } else {
        result = result.sort('createdAt');
    }
    //fields functionality (to see only certain values from DB)
    if(fields) {
        const selectFields = fields.split(',').join(' ');
        result = result.select(selectFields);
    }
    //limit and skip setup;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page -1) * limit;
    result = result.skip(skip).limit(limit)
    //
    const products = await result;
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {getAllProducts, getAllProductsStatic}