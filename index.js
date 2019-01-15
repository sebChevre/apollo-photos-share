//requiert appolo-server
const {ApolloServer} = require('apollo-server')
const { GraphQLScalarType } = require('graphql')

//in memroy datas
var _photoId = 0
var users = [
    { "githubLogin": "mHattrup", "nom": "Mike Hattrup" },
    { "githubLogin": "gPlake", "nom": "Glen Plake" },
    { "githubLogin": "sSchmidt", "nom": "Scot Schmidt" }
]

var photos = [
    {
        "id": "1",
        "nom": "Dropping the Heart Chute",
        "description": "The heart chute is one of my favorite chutes",
        "categorie": "ACTION",
        "githubUser": "gPlake",
        "cree": "3-28-1977"
    },
    {
        "id": "2",
        "nom": "Enjoying the sunshine",
        "categorie": "SELFIE",
        "githubUser": "sSchmidt",
        "cree": "1-2-1985"
    },
    {
        id: "3",
        "nom": "Gunbarrel 25",
        "description": "25 laps on gunbarrel today",
        "categorie": "LANDSCAPE",
        "githubUser": "sSchmidt",
        "cree": "2018-04-15T19:09:57.308Z"
    }
]

var tags = [
    { "photoID": "1", "userID": "gPlake" },
    { "photoID": "2", "userID": "sSchmidt" },
    { "photoID": "2", "userID": "mHattrup" },
    { "photoID": "2", "userID": "gPlake" }
]

//définition des types
const typeDefs = `
	scalar DateTime
	
	type Query {
		totalPhotos: Int!
		allPhotos: [Photo!]!
		allPhotosApres(after: DateTime): [Photo!]!
	}

	type Mutation {
		postPhoto(input: PostPhotoInput): Photo!
	}
	
	type Photo {
		id: ID!
		url: String!
		nom: String!
		description: String
		categorie: PhotoCategorie!
		postePar: Utilisateur!
		utilisateursTagges: [Utilisateur!]!
		cree: DateTime
	}
	
	type Utilisateur {
	  githubLogin: ID!
	  nom: String
	  avatar: String
	  photosPostes: [Photo!]!
	  dansPhotos: [Photo!]!
	}
	
	enum PhotoCategorie {
	  SELFIE
	  PORTRAIT
	  ACTION
	  PAYSAGE
	  GRAPHIQUE
	}
	
	input PostPhotoInput { 
	  nom: String!
	  categorie: PhotoCategorie=PORTRAIT
	  description: String
	}
`

//définition des resolvers
const resolvers = {
	Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos,
        allPhotosApres: (parent, args) => {
           console.log( args.after )
            return photos.filter(photo => {
            	return photo.cree > args.after;
            })
        }
    },
	Mutation: {
		postPhoto(parent, args){

			var newPhoto = {
				id: ++_photoId,
				...args.input,
				cree: new Date()
			}
			photos.push(newPhoto)
			return newPhoto
		}
		
	},
	Photo: {
		url: parent => `http://photos.seb/${parent.id}.jpg`,
			postePar: parent => {
            	return users.find(u => u.githubLogin === parent.githubUser)
			},

        utilisateursTagges: parent => tags

        // Returns an array of tags that only contain the current photo
            .filter(tag => tag.photoID === parent.id)

            // Converts the array of tags into an array of userIDs
            .map(tag => tag.userID)

            // Converts array of userIDs into an array of user objects
            .map(userID => users.find(u => u.githubLogin === userID))
	},
	Utilisateur: {
		photosPostes: parent => {
			return photos.filter(p => p.githubUser === parent.githubLogin)
		},
        dansPhotos: parent => tags

        // Returns an array of tags that only contain the current user
            .filter(tag => tag.userID === parent.id)

            // Converts the array of tags into an array of photoIDs
            .map(tag => tag.photoID)

            // Converts array of photoIDs into an array of photo objects
            .map(photoID => photos.find(p => p.id === photoID))
	},
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value.',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })

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
