import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const mongoURI = 'mongodb+srv://Abinraj:nkoJuWuPzW85Syrn@keam.mhwf7lr.mongodb.net/?retryWrites=true&w=majority&appName=Keam'; // Replace with your MongoDB connection string

const addAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Keam2025@admin', salt); 

    // Create admin user
    const user = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    await user.save();
    console.log('Admin user created successfully:', user.username);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

addAdminUser();