import User from "../models/user.model.js"

class UserService {

    async getSignedInUser() { }

    async editUserInfo(userID, newInfo) {
        // find the user based on ID and update with data
        console.log({ newInfo })
        const updatedUser = await User.findByIdAndUpdate(userID, newInfo, { new: true })
        console.log({ userID, newInfo })

        // return newly edited version of user
        console.log({ updatedUser })
        return updatedUser
    }
}

export default UserService
