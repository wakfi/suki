const config = require('./config.json');

const permLevels = [
    { level: 0,
      name: "User",
      check: () => true
    },

    { level: 5,
      name: "Moderator",
      check: (message) => {
        try {
          if (config.modRoles.find(roleID => message.member.roles.has(roleID))) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
    },
	
	{ level: 8,
      name: "Bot Admin",
      check: (message) => config.admins.includes(message.author.id)
    },

    { level: 9,
      name: "Server Owner",
      check: (message) => {
		try 
		{
		  if(config.serverOwner == message.guild.ownerID)
		  {
			return true;
		  } else {
			return false;
		  }
		} catch (e) {
		  return false;
		}
	  }
    },
	
	{ level: 10,
      name: "Bot Developer",
      check: (message) => config.developers.includes(message.author.id)
    },

    { level: 11,
      name: "Bot Owner",
      check: (message) => config.owner == message.author.id
    }
  ];

module.exports = permLevels;