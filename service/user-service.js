const PouchDB = require('pouchdb');
const bcrypt = require("bcrypt");
const uuid = require('uuid');
const mailService = require('./mail-service')
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error')

const users = new PouchDB('datalake/users');

class UserService {
    async registration(email, password, role, name, lastName) {
        let candidate = null;

        await users.allDocs({include_docs: true}, (err, res) => {
            res.rows.forEach(user => {
                if (user.doc.email === email) {
                    candidate = user.doc.email;
                }
            })
        })

        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с таким e-mail уже существует`);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();

        const usersDocId = uuid.v4();
        await users.put({
            _id: usersDocId,
            email,
            password: hashPassword,
            activationLink,
            isActivated: false,
            role,
            name,
            lastName
        }, function (err, response) {
            if (err) {
                return console.log(err);
            }
        });

        const user = await users.get(usersDocId);
        await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/${activationLink}`);
        console.log(user);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        let userId = null;

        await users.allDocs({include_docs: true}, (err, res) => {
            res.rows.forEach(user => {
                if(user.doc.activationLink === activationLink) {
                    userId = user.doc._id;
                }
            })
        })

        if(!userId) {
            throw ApiError.BadRequest('Некорректная ссылка активации');
        }

        users.get(userId,(err, doc) => {
            doc.isActivated = true;
            users.put(doc);
        })
    }

    async login(email, password) {
        let user = null;

        await users.allDocs({include_docs: true}, (err, res) => {
            res.rows.forEach(bdUser => {
                if (bdUser.doc.email === email) {
                    user = bdUser.doc;
                }
            })
        })

        console.log(user)

        if (!user) {
            throw ApiError.BadRequest(`Пользователь с таким e-mail не найден`);
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if(!isPassEqual) {
            throw ApiError.BadRequest(`Неверный пароль`);
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken)
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError()
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if(!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await users.get(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}

    }

    async getAllUsers() {
        const allUsers = [];
        await users.allDocs({include_docs: true}, (err, res) => {
            res.rows.forEach(bdUser => {
                allUsers.push(new UserDto(bdUser.doc))
            })
        })

        return allUsers;
    }
}

module.exports = new UserService();