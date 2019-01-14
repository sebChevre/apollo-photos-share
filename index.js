//requiert appolo-server
const {ApolloServer} = require('apollo-server')

//in memroy datas
var _photoId = 0
var photos = []

//définition des types
const typeDefs = `
	
	type Query {
		totalPhotos: Int!
		allPhotos: [Photo!]!
	}

	type Mutation {
		postPhoto(nom: String!, description: String): Photo!
	}
	
	type Photo {
		id: ID!
		url: String!
		nom: String!
		description: String
	}
`

//définition des resolvers
const resolvers = {
	Query: {
	    totalPhotos: () => photos.length,
		allPhotos: () => photos
	},
	Mutation: {
		postPhoto(parent, args){

			var newPhoto = {
				id: ++_photoId,
				...args
			}
			photos.push(newPhoto)
			return newPhoto
		}
		
	}
}

//création du serveur et config type et reolvers
const server = new ApolloServer ({
	typeDefs,
	resolvers
})

//démarrage server
server
  .listen()
  .then(({url}) => console.log(`Graphql appolo impl server running on port ${url}`))
