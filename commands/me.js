

const execute = async (client, msg) => {
    {
    msg.reply(
      `*✅ Whatsapp ID* \nMy ID : ${msg.from}\nYour Id : ${msg.to}`
    );
  }
};

module.exports = {
  name: "Chechk whatsapp id",
  description: "check whatsapp id",
  command: "!me",
  commandType: "admin",
  isDependent: false,
  help: `Check whatapp id and add to list`,
  execute,
};
