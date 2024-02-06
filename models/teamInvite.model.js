// import mongoose, { Schema } from 'mongoose';
import mongoose from 'mongoose';

const TeamInviteSchema = new mongoose.Schema({
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    accessLevel: {
        type: String,
        enum: ['admin', 'member'],
        required: true
    },
    token: String, // for invitation link/token
    expirationDate: Date
});

export default mongoose.model('TeamInvite', TeamInviteSchema);








/* const teamInviteSchema = new mongoose.Schema({
  invitedUserID: {
    type: String,
    required: true,
  },
  accessLevel: {
    type: String,
    enum: ['admin', 'member'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  email: {
    type: String,
    required: true, 
}, 
organizationID: {
    type: Schema.Types.ObjectId,
    ref: 'Organization', 
    required: true,
}, 

  
}); 

// Static method to create a new team invitation
teamInviteSchema.statics.createTeamInvite = async function ({ invitedUserID, accessLevel, status }) {
    try {
      const teamInvite = await this.create({
        invitedUserID,
        accessLevel,
        status,
      });
  
      return teamInvite;
    } catch (error) {
      console.error(`Error creating team invitation: ${error.message}`);
      throw error;
    }
  };
  
  // Static method to associate the team invitation with the corresponding team
  teamInviteSchema.statics.associateTeam = async function (teamInviteID, teamID) {
    try {
      const teamInvite = await this.findById(teamInviteID);
      if (!teamInvite) {
        throw new Error('Team invitation not found');
      }
  
    
      const team = await mongoose.model('Team').findById(teamID);
      if (!team) {
        throw new Error('Team not found');
      }
  
      team.teamInvitations.push(teamInviteID);
      await team.save();
  
      return teamInvite;
    } catch (error) {
      console.error(`Error associating team invitation with team: ${error.message}`);
      throw error;
    }
  };
  
  const TeamInvite = mongoose.model('TeamInvite', teamInviteSchema);
  
  export default TeamInvite;

  */