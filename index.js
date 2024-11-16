// server.js
// ​http://127.0.0.1:8000/api/v1/nfts
import express from 'express';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import cors from "cors";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

const DB_URI = process.env.MONGODB_CONNECTION_STRING.replace("<db_password>", process.env.MONGODB_PASSWORD);

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(con => {
    // console.log(con.connection);
    // console.log("DB connected successfully");
})

// chainId contractAddress name symbol creator createdAt price maxSupply imageURI
const nftSchema = new mongoose.Schema({
    chainId: {
        type: Number,
        required: true
    },
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
    imageURI: {
        type: String,
        required: true
    }
});

const NFT = mongoose.model("NFT", nftSchema);

// "chainId": 111555,
// "contractAddress": "caca56",
// "name": "Dom",
// "symbol": "D",
// "creator": "ml",
// "createdAt": 1234,
// "price": 45,
// "maxSupply": 123,
// "imageURI": "papa"

// Done
// chainId contractAddress name symbol creator createdAt price maxSupply imageURI



app.get("/", (req, res) => {
    res.send("Express server working...")
})

// To get all NFTs
app.get('/api/v1/nfts', async (req, res) => {


    let queryObj = { ...req.query };
    let excludedFields = ["page", "sort", "limit", "fields", "order"];
    excludedFields.forEach(el => delete queryObj[el]);


    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    queryObj = JSON.parse(queryStr);
    console.log(req.query, queryObj);


    try {

        // QUERY THE DATABASE WITH queryObj;
        let query = NFT.find(queryObj);

        //SORT, FILTER, PAGINATE ETC THE RESULT

        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(",").join(" ");
        //     console.log(sortBy)
        //     query = query.sort(sortBy);

        // } else {
        //     query = query.sort("createdAt"); //ascending order
        // }

        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(",").map(field => {
        //         // Check if field already has a minus for descending
        //         return field.startsWith('-') ? field : -${field}
        //     }).join(" ");
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort("createdAt"); // Ascending order
        // }

        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(",").join(" ");
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort("-createdAt"); // Default to descending order if no sort query
        // }

        if (req.query.sort) {
            // Determine the sorting order: ascending or descending
            const order = req.query.order?.toLowerCase() === "desc" ? "-" : "";
            const sortBy = req.query.sort.split(",").map(field => `${order}${field}`).join(" ");
            console.log(sortBy);
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt"); // Default to descending order if no sort query
        }



        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // page=2&limit3, page 1,1-10, page 2,11-20,.....
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;

        if (req.query.limit) {
            query = query.limit(Number(req.query.limit));
        }

        if (req.query.page) {


            const newNFTs = await NFT.countDocuments();
            if (skip >= newNFTs) throw new Error("This page does not exist");
            query = query.skip(skip).limit(limit);

        }
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
app.get('/api/v1/nfts/:id', async (req, res) => {

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
app.post('/api/v1/nfts', async (req, res) => {

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


// lfg