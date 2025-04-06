import mongoose from "mongoose";  

async function connectDB() {  
  try {  
    console.log('MONGO_URI:', process.env.MONGO_URI); // Debug  
    await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options  
    console.log("MONGO DB connected");  
  } catch (error) {  
    console.error("Mongodb connection error:", error);  
    process.exit(1);  
  }  
}  

export default connectDB;  