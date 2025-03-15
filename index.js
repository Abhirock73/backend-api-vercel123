const express = require('express');


const PORT =process.env.PORT || 3000;
const cors = require("cors");
const mongose = require('mongoose');
const bannerRouter = require('./routes/banner');
const categoryRouter = require('./routes/category');
const subCategoryRouter = require('./routes/sub_category');
const productRouter = require('./routes/product');
const RatingReviewRouter = require('./routes/rating_review');
const vendorRouter = require('./routes/vendor');
const app = express();
const authRoutes =require('./routes/auth');
const orderRoutes = require('./routes/order');

const DB = process.env.MONGO_URI || "mongodb+srv://abhirock:abhirock@cluster0.6vmh6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.use(express.json());
app.use(cors({
  origin: '*', // Allow requests from this origin
  methods: 'GET, POST, PUT, DELETE, OPTIONS,PATCH', // Allowed HTTP methods
  allowedHeaders: 'Content-Type, Authorization, x-auth-token', // Allowed headers
  credentials: true, // Allow cookies and credentials
}));

app.options('*', cors());

app.use(authRoutes);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(RatingReviewRouter);
app.use(vendorRouter);
app.use(orderRoutes);

mongose.connect(DB).then(()=>{
        console.log("connected");
});



app.listen(PORT,"0.0.0.0" , function(){

    console.log(`server is running on port ${PORT}`);

});