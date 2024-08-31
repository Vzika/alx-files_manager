import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    // Connect to MongoDB
    const url = `mongodb://${DB_HOST}:${DB_PORT}`;
    this.client = new MongoClient(url, {
      useNewUrlTopology: true,
    });
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(DB_DATABASE);
      })
      .catch((err) => {
        console.error(`Error connecting to MongoDB: ${err}`);
      });
  }

  // Check if the connection to MongoDB is established
  isAlive() {
    // return !!this.db; // Not too understandable
    return this.client.isConnected();
  }

  // Fetch a user from the collection users
  async getUserBy(attributes) {
    const usersCollection = this.db.collection('users');
    const user = await usersCollection.findOne(attributes);
    return user;
  }

  // Fetch all users
  async getUsers() {
    const usersCollection = this.db.collection('users');
    const users = await usersCollection.find().toArray();
    return users;
  }

  // returns the number of documents in the collection users
  async nbUsers() {
    try {
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      throw new Error(`Error counting users: ${error.message}`);
    }
  }

  // returns the number of documents in the collection files
  async nbFiles() {
    try {
      const filesCollection = this.db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      throw new Error(`Error counting files: ${error.message}`);
    }
  }

  // Create a new file in the collection files
  async createFile(attributes) {
    const filesCollection = this.db.collection('files');
    const file = await filesCollection.insertOne(attributes);
    return file;
  }

  // Fetch a file from the collection files
  async getFileBy(attributes) {
    const filesCollection = this.db.collection('files');
    const file = await filesCollection.findOne(attributes);
    return file;
  }
}

const dbClient = new DBClient();
export default dbClient;
