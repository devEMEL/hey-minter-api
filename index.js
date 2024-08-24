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

const nftSchema = new mongoose.Schema({
    contractAddress: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    maxSupply: {
        type: Number,
        required: true
    },
    tokenURI: {
        type: String,
        required: true
    }
});

const NFT = mongoose.model("NFT", nftSchema);

// "contractAddress": "caca",
// "name": "Dom",
// "symbol": "D",
// "creator": "ml",
// "createdAt": 1234,
// "price": 45,
// "maxSupply": 123,
// "tokenURI": "papa"





// To get all NFTs
app.get('/api/v1/nfts', async(req, res) => {


    let queryObj = { ...req.query };
    let excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach(el => delete queryObj[el]);
    

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    queryObj = JSON.parse(queryStr);
    console.log(req.query, queryObj);


    try {

        // QUERY THE DATABASE WITH queryObj;
        let query = NFT.find(queryObj);
        
        //SORT, FILTER, PAGINATE ETC THE RESULT

        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            console.log(sortBy)
            query = query.sort(sortBy);

        } else {
            query = query.sort("createdAt"); //ascending order
        }

        // if (req.query.fields) {

        // }

        // if (req.query.page) {

        // }
        const nfts = await query;
        console.log(nfts);
        res.status(200).json({
            status: "success",
            results: nfts.length,
            data: {
                nfts,
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err,
        })
    }
});

// To get a single NFT by ID
app.get('/api/v1/nfts/:id', async(req, res) => {

    const nft = await NFT.findById(req.params.id);
    try {
        res.status(200).json({
            status: "success",
            data: {
                nft,
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err,
        })
    }
});

// TO CREATE AN NFT
app.post('/api/v1/nfts', async(req, res) => {

    const newNFT = await NFT.create(req.body);
    if (!newNFT || Object.keys(newNFT).length === 0) {
        return res.status(400).json({
            status: "failed",
            message: "No data passed"
        });
    }
    try {
        res.status(201).json({
            status: "success",
            data: {
                nft: newNFT,
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err,
        })
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
