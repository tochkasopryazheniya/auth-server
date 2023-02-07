module.exports = class UserDto {
    email;
    id;
    isActivated;
    role;
    name;
    lastName;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.role = model.role;
        this.name = model.name;
        this.lastName = model.lastName;
    }
}