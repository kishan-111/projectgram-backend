const express = require('express')
require('dotenv').config()
const app = express()
const mongoose =require('mongoose')
const PORT = process.env.PORT
const MONGODB_URL = process.env.MONGODB_URL
const cors = require('cors')

app.use(cors())
mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', () =>{
    console.log("Connected to MongoDB");
})

mongoose.connection.on('error',(err) =>{
    console.log("Error in connection", err);
})

app.listen(PORT, () =>{
    console.log("Server is running on", PORT)
})

require('./models/User');
require('./models/Post');

app.use(express.json());
app.get("/",(req, res)=>{
    res.send("hiii")
})
app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));