const jwt = require('jsonwebtoken');
const PouchDB = require('pouchdb');
const tokens = new PouchDB('datalake/tokens');
const uuid = require('uuid');


class TokenService {
    generateTokens(payload) {
        const accessToken =  jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {expiresIn: '15min'});
        const refreshToken =  jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {expiresIn: '30d'});
        return {accessToken, refreshToken}
    }

    validateAccessToken(token) {
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
            return userData;
        }catch(e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try{
            const userData = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
            return userData;
        }catch(e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        let tokenId = null;

        await tokens.allDocs({include_docs: true}, (err, res) => {
            res.rows.forEach(token => {
                if (token.doc.user === userId) {
                    tokenId = token.doc._id;
                }
            })
        })

        if(tokenId) {
            tokens.get(tokenId, (err, doc) => {
                doc.refreshToken = refreshToken
                tokens.put(doc)
            })
        } else {
            const tokenDocId = uuid.v4();
            tokens.put({
                _id: tokenDocId,
                user: userId,
                refreshToken
            }, function (err, response) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    }

    async removeToken(refreshToken) {
        let tokenId = null;
        await tokens.allDocs({include_docs: true}, (err, res) => {
            res.rows.forEach(token => {
                if (token.doc.refreshToken === refreshToken) {
                    tokenId = token.doc._id;
                }
            })
        })
        await tokens.get(tokenId).then(function (doc) {
            return tokens.remove(doc);
        });

        return [];
    }

    async findToken(refreshToken) {
        let tokenData = null;
        await tokens.allDocs({include_docs: true}, (err, res) => {
            res.rows.forEach(token => {
                if (token.doc.refreshToken === refreshToken) {
                    tokenData = token.doc;
                }
            })
        })

        return tokenData;
    }
}

module.exports = new TokenService();