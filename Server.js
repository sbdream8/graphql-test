import { ApolloServer, gql } from 'apollo-server';
import Mongoose from 'mongoose';

const userSchema = new Schema({
    firstName: String,
    lastName: String,
});

const User = model("User", userSchema);

const MONGODB =
    "<YOUR_MONGODB_KEY>";

const typeDefs = gql`
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        fullName: String!
    }

    type Query {
        allUsers: [User!]!
    }

    type Mutation {
        createUser(firstName: String!, lastName: String!): User!
        deleteUser(id: ID!): User
    }
`;
const resolvers = {
    Query: {
        async allUsers() {
            return await User.find();
        },
    },

    Mutation: {
        async createUser(_, { firstName, lastName }) {
            const newUser = new User({ firstName, lastName });
            return await newUser.save();
        },

        async deleteUser(_, { id }) {
            const userToDelete = await User.findById(id);
            if (!userToDelete) {
                throw new Error("User not found");
            }

            await User.deleteOne(userToDelete);

            return userToDelete;
        },
    },

    User: {
        fullName({ firstName, lastName }) {
        return `${firstName} ${lastName}`;
        },
    },
};
const server = new ApolloServer({ typeDefs, resolvers });

mongoose
    .connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
        console.log("MongoDB connected");
        return server.listen({ port: 4000 });
    })
    .then((res) => {
        console.log(`Server running at ${res.url}`);
    });