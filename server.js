require("dotenv").config()
const {PORT, DB_NAME, DB_PASSWORD, DB_HOST, DB_PORT} = process.env
const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")

app.use(cors())
app.use(express.json())


//DB Connection
//local DB
// mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)

//Online DB
mongoose.connect("mongodb+srv://jackhe:jackhefoong511@cluster0.vjzk6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
mongoose.connection.once("open", () => console.log("Connected to MongoDB 8)"))

app.use(express.static("public")) //localhost:4000.public/img.jpg
app.use("/auth", require("./routes/auth"))
app.use("/products", require("./routes/products"))
app.use("/cart", require("./routes/carts"))
app.use("/orders", require("./routes/orders"))


app.listen(process.env.PORT, () => console.log(`Server is running in port ${process.env.PORT}`))