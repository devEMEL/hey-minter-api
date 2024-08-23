// server.js
import express from 'express';
import dotenv from "dotenv";
import mongoose from 'mongoose';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DB_URI = process.env.MONGODB_CONNECTION_STRING.replace("<db_password>", process.env.MONGODB_PASSWORD);

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(con => {
    console.log(con.connection);
    console.log("DB connected successfully");
})





// To get all NFTs
app.get('/api/v1/nfts', (req, res) => {


    let queryObj = { ...req.query };
    let excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach(el => delete queryObj[el]);
    console.log(req.query, queryObj);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    queryObj = JSON.parse(queryStr);


    try {
        // res.status(200).json({
        //     status: "success",
        //     data: "ALL NFT..."
        // });
        // QUERY THE DATABASE WITH queryObj;
        //SORT, FILTER, PAGINATE ETC THE RESULT
        if(req.query.sort) {

        }

        if(req.query.fields) {

        }

        if(req.query.page) {

        }
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: "Failed to get NFTs"
        })
    }
});

// To get a single NFT by ID
app.get('/api/v1/nfts/:id', (req, res) => {
    const nftId = req.params.id;
    try {
        res.status(200).json({
            status: "success",
            data: {
                id: nftId,
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: "Failed to get NFTs"
        })
    }
});

// TO CREATE AN NFT
app.post('/api/v1/nfts', (req, res) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            status: "failed",
            message: "No data passed"
        });
    }
    try {
        res.status(201).json({
            status: "success",
            data
        });
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: "Failed to post NFT"
        })
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
