import Joi from "joi";
import UsersEntity from "../models/users.model.mjs";

export default class UsersProvider {
  static async getUser(filters, projection, options) {
    await UsersEntity.find({})
    const user = await UsersEntity.findOne(filters, projection, options);
    return user;
  }

  static async addUser(body) {
    let addedUser = new UsersEntity(body);
    addedUser = addedUser.save();

    return addedUser;
  }

  static createUserSchema = (user) => {
    const schema = Joi.object({
      username: Joi.string().trim().min(1).max(50).required(),
      email: Joi.string().min(6).max(50).email().required(),
      password: Joi.string()
        .min(6)
        .max(30)
        .trim()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{6,}$/
        )
        .messages({
          "string.pattern.base": `"password" must include at least a number, an uppercase letter, a lowercase letter and a special character.`,
        })
        .required(),
    });
    return schema.validate(user);
  };
}
