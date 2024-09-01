import { createHash } from 'crypto';
import { v4 } from 'uuid';

import dbClient from '../utils/db';
import getUserByToken from '../utils/getUser';
import redisClient from '../utils/redis';

export default class AuthController {
  // Sign-in a user by generating a new authentication token
  static async getConnect(req, res) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) return res.status(401).send({ error: 'Unauthorized' });
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');
    if (!email || !password) return res.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.getUserBy({ email });
    const hashedPassword = createHash('sha1').update(password).digest('hex');
    if (!user || user.password !== hashedPassword) return res.status(401).send({ error: 'Unauthorized' });

    // Generate a new authentication token with uuidv4
    const token = v4();
    const value = user._id.toString();
    await redisClient.set(`auth_${token}`, value, 86400);

    // Set the token in the response header and return it in a JSON response
    res.set('X-Token', token);
    return res.status(200).send({ token });
  }

  // sign-out a user based on a token
  static async getDisconnect(req, res) {
    // Obtain the Authorization token from the header
    const token = req.headers('x-token');
    if (!token) return res.status(401).send({ error: 'Unauthorized' });
    const userId = await getUserByToken(req);
    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    // Delete the token from redis
    await redisClient.del(`auth_${token}`);
    return res.status(204).end();
  }
}
