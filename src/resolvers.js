import User from './models/User.js';
import { ToDo } from './models/ToDo.js';
import { BlacklistedToken } from './models/BlackListedToken.js';
import { sendMail } from '../utils/sendMail.js';
import checkAuth from '../utils/checkAuth.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const generateTokens = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  }); // short-lived
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  }); // long-lived
  return { token, refreshToken };
};

const resolvers = {
  Query: {
    hello: () => 'Hello GraphQL 👋',
    me: async (_, __, { userId }) => {
      const uid = checkAuth(userId); // throws if not logged in
      return User.findById(uid);
    },
    todos: async () => {
      return await ToDo.find().populate('createdBy');
    },
    todo: async (_, { id }) => {
      return await ToDo.findById(id).populate('createdBy');
    },
    todosByMe: async (_, __, { userId }) => {
      const uid = checkAuth(userId); // throws if not logged in
      return await ToDo.find({ createdBy: uid }).populate('createdBy');
    },
    TodosByStatus: async (_, { status }, { userId }) => {
      checkAuth(userId); // throws if not logged in
      return await ToDo.find({ status }).populate('createdBy');
    },
  },
  Mutation: {
    signup: async (_, { email }) => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

      let user = await User.findOne({ email });
      if (!user) {
        user = new User({ email, otp, otpExpiry });
      } else {
        user.otp = otp;
        user.otpExpiry = otpExpiry;
      }
      await user.save();

      await sendMail(email, 'Your OTP Code', `Your OTP is ${otp}`);

      return { message: 'OTP sent to email' };
    },
    verifyOtp: async (_, { email, otp, password }) => {
      const user = await User.findOne({ email });
      if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
        throw new Error('Invalid or expired OTP');
      }

      user.password = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      return { message: 'Account verified. You can login now.' };
    },
    login: async (_, { email, password }) => {
      const hashed = crypto.createHash('sha256').update(password).digest('hex');
      const user = await User.findOne({
        email,
        password: hashed,
        isVerified: true,
      });

      if (!user) throw new Error('Invalid credentials');

      const { token, refreshToken } = generateTokens(user._id.toString());

      return { token, refreshToken, user };
    },
    logout: async (_, __, { userId, token }) => {
      const { uid } = checkAuth(userId);
      await BlacklistedToken.create({ token, userId });
      return { message: 'Logged out successfully' };
    },
    refreshToken: async (_, { refreshToken }) => {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        const { token, refreshToken: newRefresh } = generateTokens(
          decoded.userId
        );

        const user = await User.findById(decoded.userId);
        if (!user) throw new Error('User not found');

        return { token, refreshToken: newRefresh, user };
      } catch {
        throw new Error('Invalid or expired refresh token');
      }
    },
    createTodo: async (_, { name, description }, { userId }) => {
      const uid = checkAuth(userId); // throws if not logged in
      const todo = new ToDo({ name, description, createdBy: uid });
      await todo.save();
      return todo;
    },
    updateTodo: async (_, { id, name, description, status }, { userId }) => {
      const uid = checkAuth(userId); // throws if not logged in
      const todo = await ToDo.findById(id);
      if (!todo) throw new Error('ToDo not found');
      if (todo.createdBy.toString() !== uid)
        throw new Error('Not authorized to update this ToDo');
      if (name !== undefined) todo.name = name;
      if (description !== undefined) todo.description = description;
      if (status !== undefined) todo.status = status;
      await todo.save();
      return todo;
    },
    deleteTodo: async (_, { id }, { userId }) => {
      const uid = checkAuth(userId); // throws if not logged in
      const todo = await ToDo.findById(id);
      if (!todo) throw new Error('ToDo not found');
      if (todo.createdBy.toString() !== uid)
        throw new Error('Not authorized to delete this ToDo');
      await todo.remove();
      return { message: 'ToDo deleted successfully' };
    },
  },
};

export default resolvers;
